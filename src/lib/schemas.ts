import { z } from "zod"

// Vehicle schema -- camelCase field names matching form fields
export const vehicleSchema = z.object({
  stockNumber: z.string().min(1, { error: "Stock number is required" }),
  vin: z.string().min(11, { error: "VIN must be at least 11 characters" }),
  year: z
    .number({ error: "Year is required" })
    .min(1900, { error: "Year must be between 1900 and 2030" })
    .max(2030, { error: "Year must be between 1900 and 2030" }),
  make: z.string().min(1, { error: "Make is required" }),
  model: z.string().min(1, { error: "Model is required" }),
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  vehicleType: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  mileage: z.number().optional(),
  mileageType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  engine: z.string().optional(),
  cylinders: z.number().optional(),
  drivetrain: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().optional(),
  buyerFee: z.number().optional(),
  lotFee: z.number().optional(),
  sellingPrice: z.number().optional(),
  status: z.string().optional(),
  locationCode: z.string().optional(),
  features: z.string().optional(),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>

// Customer schema
export const customerSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z
    .union([z.email({ error: "Enter a valid email" }), z.literal("")])
    .optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  driversLicense: z.string().optional(),
  notes: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

// Lead schema
export const leadSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z
    .union([z.email({ error: "Enter a valid email" }), z.literal("")])
    .optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  vehicleInterest: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadSchema>

// Deal schema
export const dealSchema = z.object({
  vehicleId: z.string().min(1, { error: "Vehicle is required" }),
  customerId: z.string().min(1, { error: "Customer is required" }),
  saleType: z.string().min(1, { error: "Sale type is required" }),
  sellingPrice: z
    .number()
    .min(0, { error: "Selling price must be 0 or greater" }),
  tradeAllowance: z.number().optional(),
  tradePayoff: z.number().optional(),
  downPayment: z.number().optional(),
  taxRate: z.number().optional(),
  titleFee: z.number().optional(),
  registrationFee: z.number().optional(),
  docFee: z.number().optional(),
  otherFees: z.number().optional(),
  apr: z.number().optional(),
  term: z.number().optional(),
  notes: z.string().optional(),
})

export type DealFormValues = z.infer<typeof dealSchema>
