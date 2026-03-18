import { describe, it, expect } from "vitest"
import { validateRequest } from "@/lib/api-validation"
import { vehicleSchema } from "@/lib/schemas"

describe("validateRequest", () => {
  it("returns success with valid data", () => {
    const validData = {
      stockNumber: "S001",
      vin: "12345678901",
      year: 2020,
      make: "Toyota",
      model: "Camry",
    }
    const result = validateRequest(vehicleSchema, validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it("returns failure with status 400 and fieldErrors for invalid data", async () => {
    const result = validateRequest(vehicleSchema, {})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
      const body = await result.response.json()
      expect(body.error).toBe("Validation failed")
      expect(body.fieldErrors).toBeDefined()
      expect(typeof body.fieldErrors).toBe("object")
    }
  })

  it("fieldErrors keys are dot-path strings matching Zod issue paths", async () => {
    const result = validateRequest(vehicleSchema, {
      stockNumber: "",
      vin: "",
      year: 0,
      make: "",
      model: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response.json()
      const keys = Object.keys(body.fieldErrors)
      expect(keys).toContain("stockNumber")
      expect(keys).toContain("vin")
      expect(keys).toContain("make")
      expect(keys).toContain("model")
    }
  })
})
