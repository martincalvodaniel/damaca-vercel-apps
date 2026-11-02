import { expect, test as it } from "bun:test"

// Keep authentication and action mocks out of the application test process.
it("household task actions authorize, validate, handle failures and revalidate only their page", () => {
  const result = Bun.spawnSync(
    [
      process.execPath,
      "-e",
      `
    import { mock } from "bun:test";
    import assert from "node:assert/strict";
    let authorized = true;
    let authorizedCalls = 0;
    let mutations = 0;
    let failure = null;
    const paths = [];
    class HouseholdTaskConflict extends Error {}
    mock.module("server-only", () => ({}));
    mock.module("@/lib/auth/session", () => ({ requireAuthorizedSession: async () => {
      authorizedCalls++;
      if (!authorized) throw new Error("Unauthorized");
    } }));
    mock.module("@/lib/db/household-tasks", () => ({ HouseholdTaskConflict, mutateHouseholdTask: async () => { mutations++; if (failure) throw failure; } }));
    mock.module("next/cache", () => ({ revalidatePath: (path) => paths.push(path) }));
    const { householdTaskAction } = await import("./src/features/household-tasks/actions.ts");
    const valid = { kind: "create", taskId: "93a8bcc4-47a1-4466-ab01-c0860c595dd2", name: "Sheets", intervalDays: 7 };
    authorized = false;
    await assert.rejects(() => householdTaskAction(valid), /Unauthorized/);
    assert.equal(mutations, 0);
    authorized = true;
    assert.equal((await householdTaskAction({ ...valid, intervalDays: 0 })).success, false);
    assert.equal(mutations, 0);
    assert.deepEqual(await householdTaskAction(valid), { success: true });
    assert.deepEqual(paths, ["/household-tasks"]);
    failure = new HouseholdTaskConflict("Conflicto de programación");
    assert.deepEqual(await householdTaskAction(valid), { success: false, message: "Conflicto de programación" });
    failure = new Error("Sensitive database failure details");
    const failed = await householdTaskAction(valid);
    assert.equal(failed.success, false);
    assert(!failed.message.includes("Sensitive"));
    assert.deepEqual(paths, ["/household-tasks"]);
    assert.equal(authorizedCalls, 5);
  `,
    ],
    { cwd: process.cwd(), stdout: "pipe", stderr: "pipe" }
  )
  expect(new TextDecoder().decode(result.stderr)).toBe("")
  expect(result.exitCode).toBe(0)
})
