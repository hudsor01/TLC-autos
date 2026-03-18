export interface DealInputs {
  sellingPrice: number
  tradeAllowance: number
  tradePayoff: number
  downPayment: number
  taxRate: number
  titleFee: number
  registrationFee: number
  docFee: number
  otherFees: number
  apr: number
  term: number
  saleType: string
}

export interface DealCalculations {
  netTrade: number
  taxAmount: number
  totalFees: number
  totalPrice: number
  amountFinanced: number
  monthlyPayment: number
}

export function calculateDeal(inputs: DealInputs): DealCalculations {
  const netTrade = inputs.tradeAllowance - inputs.tradePayoff
  const taxableAmount = inputs.sellingPrice - inputs.tradeAllowance
  const taxAmount = Math.max(0, taxableAmount * (inputs.taxRate / 100))
  const totalFees =
    inputs.titleFee + inputs.registrationFee + inputs.docFee + inputs.otherFees
  const totalPrice = inputs.sellingPrice - netTrade + taxAmount + totalFees
  const amountFinanced = totalPrice - inputs.downPayment

  let monthlyPayment = 0
  if (
    (inputs.saleType === "finance" || inputs.saleType === "bhph") &&
    inputs.term > 0 &&
    amountFinanced > 0
  ) {
    if (inputs.apr > 0) {
      const monthlyRate = inputs.apr / 100 / 12
      monthlyPayment =
        (amountFinanced *
          monthlyRate *
          Math.pow(1 + monthlyRate, inputs.term)) /
        (Math.pow(1 + monthlyRate, inputs.term) - 1)
    } else {
      monthlyPayment = amountFinanced / inputs.term
    }
  }

  return {
    netTrade,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalFees,
    totalPrice: Math.round(totalPrice * 100) / 100,
    amountFinanced: Math.round(amountFinanced * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
  }
}
