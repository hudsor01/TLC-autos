import { describe, it, expect } from "vitest"
import {
  vehicleSchema,
  customerSchema,
  leadSchema,
  dealSchema,
} from "@/lib/schemas"

describe("vehicleSchema", () => {
  it("accepts valid vehicle data", () => {
    const result = vehicleSchema.safeParse({
      stockNumber: "S001",
      vin: "12345678901",
      year: 2020,
      make: "Toyota",
      model: "Camry",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid vehicle data with field errors", () => {
    const result = vehicleSchema.safeParse({
      stockNumber: "",
      vin: "",
      year: 0,
      make: "",
      model: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("stockNumber")
      expect(paths).toContain("vin")
      expect(paths).toContain("make")
      expect(paths).toContain("model")
    }
  })
})

describe("customerSchema", () => {
  it("accepts valid customer data", () => {
    const result = customerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid customer data with field errors", () => {
    const result = customerSchema.safeParse({
      firstName: "",
      lastName: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("firstName")
      expect(paths).toContain("lastName")
    }
  })
})

describe("leadSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = leadSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe("dealSchema", () => {
  it("accepts valid deal data", () => {
    const result = dealSchema.safeParse({
      vehicleId: "abc",
      customerId: "def",
      saleType: "cash",
      sellingPrice: 10000,
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid deal data with field errors", () => {
    const result = dealSchema.safeParse({
      vehicleId: "",
      customerId: "",
      saleType: "",
      sellingPrice: -1,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("vehicleId")
      expect(paths).toContain("customerId")
      expect(paths).toContain("saleType")
      expect(paths).toContain("sellingPrice")
    }
  })
})
