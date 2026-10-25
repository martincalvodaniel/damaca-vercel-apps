import { describe, expect, it } from "bun:test"
import { resolveConsumerOrigin } from "./origin"

describe("resolveConsumerOrigin", () => {
  it("prefers an explicitly configured environment URL", () => {
    expect(
      resolveConsumerOrigin({
        environment: "int",
        explicitUrl: "https://consumer.example.test",
        branchUrl: "consumer-git-int.vercel.app",
        productionUrl: "consumer.example.com",
      })
    ).toBe("https://consumer.example.test")
  })

  it("uses stable Vercel aliases and ignores commit deployment URLs", () => {
    expect(
      resolveConsumerOrigin({
        environment: "int",
        branchUrl: "consumer-git-int-team.vercel.app",
        productionUrl: "consumer.example.com",
      })
    ).toBe("https://consumer-git-int-team.vercel.app")
    expect(
      resolveConsumerOrigin({
        environment: "production",
        branchUrl: "consumer-git-int-team.vercel.app",
        productionUrl: "consumer.example.com",
      })
    ).toBe("https://consumer.example.com")
  })

  it("requires an explicit stable origin when Vercel aliases are unavailable", () => {
    expect(() => resolveConsumerOrigin({ environment: "int" })).toThrow()
    expect(() =>
      resolveConsumerOrigin({
        environment: "int",
        explicitUrl: "https://example.test/path",
      })
    ).toThrow()
  })
})
