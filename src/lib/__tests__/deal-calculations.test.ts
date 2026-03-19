import { describe, it, expect } from "vitest"
import { calculateDeal, type DealInputs } from "@/lib/deal-calculations"

const baseDealInputs: DealInputs = {
  sellingPrice: 20000,
  tradeAllowance: 0,
  tradePayoff: 0,
  downPayment: 0,
  taxRate: 0,
  titleFee: 0,
  registrationFee: 0,
  docFee: 0,
  otherFees: 0,
  apr: 0,
  term: 0,
  saleType: "cash",
}

describe("calculateDeal", () => {
  it("cash deal with no trade: totalPrice includes tax+fees, monthlyPayment=0", () => {
    const inputs: DealInputs = {
      ...baseDealInputs,
      sellingPrice: 20000,
      taxRate: 8.25,
      docFee: 200,
      titleFee: 50,
      registrationFee: 100,
      saleType: "cash",
    }
    const result = calculateDeal(inputs)
    // tax = 20000 * 8.25/100 = 1650
    // totalFees = 200 + 50 + 100 = 350
    // totalPrice = 20000 - 0 + 1650 + 350 = 22000
    expect(result.taxAmount).toBe(1650)
    expect(result.totalFees).toBe(350)
    expect(result.totalPrice).toBe(22000)
    expect(result.monthlyPayment).toBe(0)
  })

  it("finance deal: monthlyPayment uses amortization formula", () => {
    const inputs: DealInputs = {
      ...baseDealInputs,
      sellingPrice: 20000,
      apr: 5,
      term: 60,
      saleType: "finance",
    }
    const result = calculateDeal(inputs)
    // amountFinanced = 20000 (no trade, no fees, no tax, no down)
    // monthlyRate = 0.05/12 = 0.004167
    // payment = 20000 * 0.004167 * (1.004167^60) / ((1.004167^60) - 1)
    expect(result.monthlyPayment).toBeGreaterThan(0)
    // Expected ~377.42
    expect(result.monthlyPayment).toBeCloseTo(377.42, 0)
  })

  it("zero APR finance: monthlyPayment = amountFinanced / term", () => {
    const inputs: DealInputs = {
      ...baseDealInputs,
      sellingPrice: 10000,
      apr: 0,
      term: 48,
      saleType: "finance",
    }
    const result = calculateDeal(inputs)
    // amountFinanced = 10000
    // monthlyPayment = 10000 / 48 = 208.33
    expect(result.monthlyPayment).toBeCloseTo(208.33, 1)
  })

  it("trade-in: netTrade reduces totalPrice", () => {
    const inputs: DealInputs = {
      ...baseDealInputs,
      sellingPrice: 20000,
      tradeAllowance: 5000,
      tradePayoff: 2000,
    }
    const result = calculateDeal(inputs)
    // netTrade = 5000 - 2000 = 3000
    // totalPrice = 20000 - 3000 + 0 + 0 = 17000
    expect(result.netTrade).toBe(3000)
    expect(result.totalPrice).toBe(17000)
  })

  it("tax calculation: taxAmount on (sellingPrice - tradeAllowance)", () => {
    const inputs: DealInputs = {
      ...baseDealInputs,
      sellingPrice: 20000,
      tradeAllowance: 5000,
      taxRate: 8.25,
    }
    const result = calculateDeal(inputs)
    // taxableAmount = 20000 - 5000 = 15000
    // taxAmount = 15000 * 8.25 / 100 = 1237.50
    expect(result.taxAmount).toBe(1237.5)
  })
})
