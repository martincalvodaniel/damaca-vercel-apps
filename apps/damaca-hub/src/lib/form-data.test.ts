import { describe, expect, it } from "bun:test"
import { getFormDataValues } from "@/lib/form-data"
import { applicationMutationSchema } from "@/schemas/hub"

describe("Server Action form data", () => {
  it("removes Next.js action metadata before strict schema validation", () => {
    const formData = new FormData()
    formData.set("id", "pocha-score")
    formData.set("name", "Pocha Score")
    formData.set("description", "Keep score and history for games of Pocha.")
    formData.set("productionUrl", "https://pocha-score.vercel.app")
    formData.set(
      "preproductionUrl",
      "https://pocha-score-git-int-martincalvodaniels-projects.vercel.app"
    )
    formData.set("order", "40")
    formData.append("active", "false")
    formData.append("active", "true")
    formData.set("$ACTION_REF_1", "server-action-reference")
    formData.set("$ACTION_KEY", "server-action-key")

    expect(
      applicationMutationSchema.safeParse(getFormDataValues(formData)).success
    ).toBe(true)
  })
})
