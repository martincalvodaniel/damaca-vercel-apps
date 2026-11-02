---

name: vercel-deploy-alias
description: Deploy a selected application and Git branch from this monorepo to Vercel and advance its stable branch alias after READY. Use for manual deployment or alias movement requests.
---

# Deploy and advance a Vercel alias

## Select the application and branch

Use choices already supplied by the user. Ask only for missing choices, presenting:
- Application: enumerate current `apps/*` directories containing a package manifest. Accept `home-management` as shorthand for `dalis-home-management` and `billing` for `billing-poc`.
- Branch: offer `int`, `main`, and another named remote branch. Discover actual branches with `git ls-remote --heads origin`. Validate the selected branch with `git check-ref-format --branch`.

Default to Preview unless the user explicitly requests production. Selecting `main` alone does not authorize production. A deployment request with alias movement authorizes both operations for the selected application and branch. Skill creation or inspection alone does not authorize deployment.

## Resolve the source and destination

1. Read the root workflow and the selected app's instructions. Resolve the exact remote branch SHA with `git ls-remote origin refs/heads/<branch>`; preserve the current checkout and local changes.
2. Use team `martincalvodaniels-projects`. Inspect the explicitly named Vercel project through `vercel project inspect <project> --scope <team> --non-interactive --json`. Confirm owner, application root, and Git repository. Use `vercel api` for fields absent from the CLI. Discover project IDs and repository IDs from responses rather than maintaining a copied registry.
3. Resolve the existing stable branch alias from Vercel aliases/deployment metadata. For int it normally resembles `<project>-git-int-martincalvodaniels-projects.vercel.app`. Verify ownership and intended branch before mutation; do not guess aliases for other branches or overwrite custom production domains during a Preview operation. Ask for the destination if it remains ambiguous.
4. Search existing deployments for the exact project, SHA, branch and environment, following pagination as needed. Reuse a matching READY deployment when the user asks to advance an alias; create a fresh deployment when explicitly requested.

## Create the manual deployment

Prefer the installed CLI's supported commands and consult `--help`. To deploy the exact remote Git commit without uploading local modifications, use the authenticated CLI API fallback with a JSON request file:

```json
{
  "name": "<verified-project-name>",
  "project": "<verified-project-id>",
  "gitSource": {
    "type": "github",
    "repoId": 123456,
    "ref": "<selected-branch>",
    "sha": "<resolved-remote-sha>"
  }
}
```

Replace `repoId` with the verified GitHub repository ID. Write JSON using a serializer, then execute:

```bash
vercel api /v13/deployments -X POST --input <request-file> --scope martincalvodaniels-projects --raw
```

For this API, omit `target` for Preview: `target: "preview"` is rejected. Set `target: "production"` only for explicitly authorized production. Preserve `git.deploymentEnabled: false`; manual requests are independent of Git push automation.

Check command exit status before parsing stdout as JSON. On HTTP 402 / `api-deployments-free-per-day`, report the quota rejection and leave the alias unchanged. Do not retry in a loop, switch accounts, or change plans. On other errors, repair a concrete request error before retrying; inspect build failures before creating another deployment.

## Wait, assign, verify

1. Wait using `vercel inspect <deployment-url> --wait --timeout 5m --scope <team> --json`. Keep the running session ID and provide progress updates. If waiting times out, inspect the same deployment; do not create a duplicate.
2. Confirm READY, project, environment and source SHA/ref. Inspect API deployment metadata if CLI output omits source fields. A failed or canceled deployment must never receive the alias.
3. Record the alias's previous deployment, then run `vercel alias set <ready-deployment-url> <verified-branch-alias> --scope <team>`.
4. Inspect the alias URL and verify it resolves to the expected deployment ID in READY and the intended environment. Report success only after this read succeeds. Preserve deployment protection; use `vercel curl` if HTTP verification is requested.
5. Return the application, branch, short SHA, environment, READY status and clickable stable alias. If deployment succeeds but alias assignment fails, report the deployment URL and exact pending alias operation.

Production requests use production builds and Vercel's production promotion/domain workflow, after verifying the selected source and existing production domains. This skill never merges branches; Git promotion follows the repository's separate promotion workflow.
