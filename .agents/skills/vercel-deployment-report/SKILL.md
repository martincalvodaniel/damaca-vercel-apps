---

name: vercel-deployment-report
description: Count Vercel deployments in the last 24 hours and report totals by status and application using the CLI. Use when asked for deployment counts or a breakdown of successful, canceled and failed deployments.
---

# Vercel deployment report

Run from the repository root:

```bash
python3 .agents/skills/vercel-deployment-report/scripts/report.py
```

The default scope is `martincalvodaniels-projects` and the window is 24 hours. Use another scope or duration only when requested. The script fixes the end timestamp before querying, paginates all projects, deduplicates records and filters both time boundaries. For a reproducible historical window, pass `--end <ISO-8601-with-timezone>`; `--hours` changes the duration.

Read the resulting JSON and respond in Spanish with the scope, exact window in Europe/Madrid, total, status totals and application table. Translate READY as successful, ERROR as failed and CANCELED as canceled. Include every other observed state under its original name; do not classify pending states as failures. Counts are deployment creation records in the window, with statuses observed during the query, not completion events during that window.

Use the script output as the sole counting source. Report a query failure rather than presenting partial counts. Do not infer trigger source from Git metadata: manual deployments from a Git reference also contain it. Do not equate canceled records with quota consumption, or the listing total with Vercel's internal quota counter. Rejected creation requests that produce no deployment record are outside this report.

This skill is read-only: it does not create, cancel or remove deployments, move aliases or change project settings. No repository edits are needed to run it. Report pagination completeness through `pagesRead` if requested.
