# Vercel deployment quota discrepancy — November 1, 2026

## Observed evidence

The owner reported this error when creating a deployment:

```text
Resource is limited - try again in 1 day (more than 100, code: "api-deployments-free-per-day").
```

The exact timestamp, response headers and error payload of that rejected request
were not captured. No deployment was attempted to reproduce it during this audit.
This report does not establish that the block is still active.

The [sanitized CLI snapshot](2026-11-01-vercel-deployment-limit.json) was captured
at **2026-11-01 22:38:26 UTC** with Vercel CLI **65.2.0**. It deliberately retains
the original audit window, **2026-10-31 22:07:35.106 UTC inclusive through
2026-11-01 22:07:35.106 UTC exclusive**, so its results can be compared directly
with the earlier investigation. This is a fixed historical window, not a live
remaining-quota query and not an asserted window around the unknown error time.
- Team: `martincalvodaniels-projects`, `team_xRmPJtGdnnn9lwHidY8CK3nG`, Hobby.
- All team projects were included; no project, environment or status filter.
- Two pages of 100 records were fetched. The second page reaches October 26,
  before the lower bound; 142 unique records fall inside the audited window.
- Sources: 139 Git, 1 CLI and 2 redeploy records. Sources describe listed records,
  not every API request that may have occurred.

| Project               |  READY | Automatically skipped (CANCELED) |   Total |
| --------------------- | -----: | -------------------------------: | ------: |
| billing-poc           |     13 |                               11 |      24 |
| card-wars             |      2 |                               23 |      25 |
| dalis-home-management |     14 |                                9 |      23 |
| dalis-tasks-events    |      1 |                               22 |      23 |
| damaca-hub            |      1 |                               22 |      23 |
| pocha-score           |      1 |                               23 |      24 |
| **Total**             | **32** |                          **110** | **142** |

Every canceled record has the same API `errorMessage`: the commit did not affect
that project. Classification checks both `state == CANCELED` and that reason;
CANCELED alone is insufficient. The snapshot contains IDs, timestamps, reasons,
branches and commit SHAs for all 142 records, without credentials or environment
values. The seventh team project, `v0-utils`, has no records in this window.

All six monorepo projects currently have:
- The expected `apps/<name>` Root Directory and the same GitHub repository.
- `enableAffectedProjectsDeployments: true`.
- `commandForIgnoringBuildStep: null`.
- Production branch `main`.

These settings were read at capture time; they are not a historical settings log.
A representative direct inspection of `dpl_FtkqVYJiPegkHrc1R3TmcXoKEfRw`
(Pocha Score, commit `8f39e8d6bf7544168bc88d6c7e199b15e35db616`) also reports
that the commit did not affect this project.

## Interpretation and limits

Vercel's [October 21 announcement](https://vercel.com/changelog/skipped-monorepo-deployments-no-longer-count-against-limits)
says automatic monorepo omissions no longer consume deployment rate limits.
The [monorepo documentation](https://vercel.com/docs/monorepos#ignoring-the-build-step)
distinguishes these from Ignored Build Step cancellations, which do consume quota.
The [limits reference](https://vercel.com/docs/limits#rate-limits) documents the
Hobby limit of 100 per 86,400 seconds at owner scope.

The visible dataset therefore contains **32 non-skipped deployments**, not 142
quota-consuming deployments under the announced policy. The earlier inference
that 142 visible records alone explained the block is withdrawn. Automatic
selection is already enabled and is demonstrably omitting unaffected projects.

This does not prove which requests Vercel's internal counter counted. Rejected
requests without deployment records, deleted records, settings history, rollout
behavior and the precise quota window at error time cannot be established from
this snapshot. An internal counting or rollout problem is a hypothesis requiring
Vercel's confirmation, not a confirmed root cause. The displayed one-day delay
also does not prove the exact unlock time.

Keep the existing Git integration and native skipping configuration. Adding an
Ignored Build Step, switching deployment systems or upgrading the plan is not
justified by this evidence.

## Reproduce the read-only audit

Use the existing authenticated CLI session. The following Python snippet invokes
only GET requests through `vercel api`, paginates until it crosses the lower bound,
checks uniqueness and prints aggregate counts. It does not expose raw project
settings, credentials or environment values. Keep the fixed bounds to reproduce
this incident; for a new audit choose both bounds once, exactly 86,400,000 ms apart.

```python
import json
import subprocess
from collections import Counter

scope = "martincalvodaniels-projects"
start_ms, end_ms = 1793484455106, 1793570855106
skip_reason = "The deployment was canceled because the commit didn’t affect this project."
rows = {}
cursor = end_ms
while True:
    endpoint = f"/v6/deployments?limit=100&until={cursor}"
    result = subprocess.run(
        ["vercel", "api", endpoint, "--scope", scope, "--raw"],
        capture_output=True, text=True, check=True, timeout=60,
    )
    page = json.loads(result.stdout)
    deployments = page["deployments"]
    for deployment in deployments:
        if start_ms <= deployment["created"] < end_ms:
            assert deployment["uid"] not in rows
            rows[deployment["uid"]] = deployment
    next_cursor = page["pagination"].get("next")
    if (not deployments
        or min(d["created"] for d in deployments) < start_ms
        or next_cursor is None):
        break
    assert next_cursor < cursor
    cursor = next_cursor
print("Total:", len(rows))
print("States:", dict(Counter(d["state"] for d in rows.values())))
print("Automatically skipped:", sum(
    d["state"] == "CANCELED" and d.get("errorMessage") == skip_reason
    for d in rows.values()
))
```

To reproduce the settings check without printing environment values:

```sh
vercel api '/v9/projects?limit=100' --scope martincalvodaniels-projects --raw |
  python3 -c 'import json,sys; data=json.load(sys.stdin); assert not data.get("pagination", {}).get("next"); print(json.dumps([{k:p.get(k) for k in ["id", "name", "rootDirectory", "enableAffectedProjectsDeployments", "commandForIgnoringBuildStep"]} for p in data["projects"]], indent=2))'
```

## Support request draft — not sent

**Subject:** Hobby deployment rate limit despite only 32 non-skipped deployments

Hello Vercel team,

My Hobby team `martincalvodaniels-projects`
(`team_xRmPJtGdnnn9lwHidY8CK3nG`) received
`api-deployments-free-per-day`, with “more than 100” and “try again in 1 day”.
I do not have the exact UTC timestamp or raw response of that failed request.

A subsequent team-wide CLI audit of the fixed 24-hour window from
2026-10-31T22:07:35.106Z to 2026-11-01T22:07:35.106Z found 142 records:
32 READY deployments and 110 CANCELED records, every one explicitly omitted
because the commit did not affect the project. Pagination covers the full window
and all team projects. The attached sanitized JSON contains every deployment ID,
timestamp, reason and the current project selection settings.

Native unaffected-project skipping is enabled for all six monorepo projects;
none has an Ignored Build Step command. Your October 21 announcement says these
automatic omissions no longer count toward deployment rate limits:
https://vercel.com/changelog/skipped-monorepo-deployments-no-longer-count-against-limits

Could you please:
1. Identify the exact quota window and requests counted for this team, including
   any rejected requests that did not create visible deployment records?
2. Confirm that these 110 automatic omissions were excluded and that the announced
   behavior applies to this team?
3. Correct or reset the counter if it counted exempt omissions incorrectly, and
   confirm when a single Preview deployment can be attempted?

We have preserved the existing Git integration and have not repeatedly attempted
deployments to probe the limit. We are asking for a quota investigation, not a plan
upgrade. Thank you.

## Recovery procedure — pending external evidence

Support has not been contacted by this audit, and no response or unlock has been
observed. [AGW-15](../../plan/iterations.md#agw-15--verify-vercel-preview-recovery)
tracks the conditional verification separately from the completed evidence work.

After Vercel confirms the unblock, verify the team, billing project, pending `int`
commit and Preview target. The last observed pending billing commit is
`8f39e8d6bf7544168bc88d6c7e199b15e35db616`; recheck it against the current branch
and recent billing deployments before acting. Use one Preview attempt only, then
inspect the exact deployment and refresh the team-wide listing. A failed attempt
must be recorded without an automatic retry. Mark recovery complete only when
that Preview reaches READY; no production deployment or promotion is part of this
procedure. Publishing the documentation to `int` can itself trigger the existing
Git integration; observe any resulting records without treating a skipped entry
as proof of recovery.
