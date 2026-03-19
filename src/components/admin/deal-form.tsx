"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { dealSchema, type DealFormValues } from "@/lib/schemas"
import { calculateDeal } from "@/lib/deal-calculations"
import { FormField } from "@/components/admin/form-field"
import { SearchableSelect } from "@/components/admin/searchable-select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface DealFormProps {
  initialData?: DealFormValues & { id?: string }
}

interface CustomerOption {
  value: string
  label: string
  sublabel?: string
}

interface VehicleOption {
  value: string
  label: string
  sublabel?: string
}

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function DealForm({ initialData }: DealFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)
  const id = initialData?.id

  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  // Fetch customers for selector
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/admin/customers?limit=1000")
        if (!res.ok) return
        const data = await res.json()
        const customers = data.customers ?? data
        setCustomerOptions(
          customers.map((c: { id: string; firstName: string; lastName: string; email?: string }) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName}`,
            sublabel: c.email || undefined,
          }))
        )
      } catch {
        // silently fail - options just won't load
      } finally {
        setLoadingCustomers(false)
      }
    }
    fetchCustomers()
  }, [])

  // Fetch vehicles for selector
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/admin/vehicles?limit=1000")
        if (!res.ok) return
        const data = await res.json()
        const vehicles = data.vehicles ?? data
        setVehicleOptions(
          vehicles.map((v: { id: string; year: number; make: string; model: string; stockNumber?: string }) => ({
            value: v.id,
            label: `${v.year} ${v.make} ${v.model}`,
            sublabel: v.stockNumber ? `Stock #: ${v.stockNumber}` : undefined,
          }))
        )
      } catch {
        // silently fail
      } finally {
        setLoadingVehicles(false)
      }
    }
    fetchVehicles()
  }, [])

  const form = useForm({
    defaultValues: initialData ?? {
      vehicleId: "",
      customerId: "",
      saleType: "cash",
      sellingPrice: 0,
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
      notes: "",
    },
    validators: {
      onSubmit: dealSchema,
      onBlur: dealSchema,
    },
    onSubmit: async ({ value }) => {
      const url = isEdit ? `/api/admin/deals/${id}` : "/api/admin/deals"
      const promise = fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          if (data.fieldErrors) {
            Object.entries(data.fieldErrors).forEach(([field, message]) => {
              form.setFieldMeta(field as keyof DealFormValues, (prev) => ({
                ...prev,
                errors: [message as string],
              }))
            })
            throw new Error("Please fix the errors below")
          }
          throw new Error(data.error || "Failed to save")
        }
        return res.json()
      })
      toast.promise(promise, {
        loading: "Saving...",
        success: isEdit ? "Changes saved" : "Deal added successfully",
        error: "Something went wrong. Please try again.",
      })
      await promise
      router.push("/admin/deals")
    },
  })

  // beforeunload warning for unsaved changes
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (form.state.isDirty) {
      e.preventDefault()
    }
  }, [form])

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [handleBeforeUnload])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Deal" : "Add Deal"}
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/deals")}
        >
          Cancel
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        {/* Deal Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Sale Type */}
              <form.Field name="saleType">
                {(field) => (
                  <FormField field={field} label="Sale Type">
                    {({ isInvalid, errorId }) => (
                      <Select
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      >
                        <option value="cash">Cash</option>
                        <option value="finance">Finance</option>
                        <option value="bhph">BHPH</option>
                        <option value="wholesale">Wholesale</option>
                      </Select>
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Empty cell for alignment */}
              <div />

              {/* Customer Selector */}
              <form.Field name="customerId">
                {(field) => (
                  <FormField field={field} label="Customer">
                    {({ isInvalid }) => (
                      <div data-field-error={isInvalid || undefined}>
                        {loadingCustomers ? (
                          <p className="text-sm text-muted-foreground py-2">
                            Loading customers...
                          </p>
                        ) : (
                          <SearchableSelect
                            value={field.state.value}
                            onValueChange={(val) => {
                              field.handleChange(val)
                              field.handleBlur()
                            }}
                            options={customerOptions}
                            placeholder="Select a customer..."
                            searchPlaceholder="Search customers..."
                            emptyMessage="No customers found."
                          />
                        )}
                      </div>
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Vehicle Selector */}
              <form.Field name="vehicleId">
                {(field) => (
                  <FormField field={field} label="Vehicle">
                    {({ isInvalid }) => (
                      <div data-field-error={isInvalid || undefined}>
                        {loadingVehicles ? (
                          <p className="text-sm text-muted-foreground py-2">
                            Loading vehicles...
                          </p>
                        ) : (
                          <SearchableSelect
                            value={field.state.value}
                            onValueChange={(val) => {
                              field.handleChange(val)
                              field.handleBlur()
                            }}
                            options={vehicleOptions}
                            placeholder="Select a vehicle..."
                            searchPlaceholder="Search vehicles..."
                            emptyMessage="No vehicles found."
                          />
                        )}
                      </div>
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Selling Price */}
              <form.Field name="sellingPrice">
                {(field) => (
                  <FormField field={field} label="Selling Price">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Down Payment */}
              <form.Field name="downPayment">
                {(field) => (
                  <FormField field={field} label="Down Payment">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Trade Allowance */}
              <form.Field name="tradeAllowance">
                {(field) => (
                  <FormField field={field} label="Trade Allowance">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Trade Payoff */}
              <form.Field name="tradePayoff">
                {(field) => (
                  <FormField field={field} label="Trade Payoff">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Tax Rate */}
              <form.Field name="taxRate">
                {(field) => (
                  <FormField field={field} label="Tax Rate (%)">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Doc Fee */}
              <form.Field name="docFee">
                {(field) => (
                  <FormField field={field} label="Doc Fee">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Title Fee */}
              <form.Field name="titleFee">
                {(field) => (
                  <FormField field={field} label="Title Fee">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Registration Fee */}
              <form.Field name="registrationFee">
                {(field) => (
                  <FormField field={field} label="Registration Fee">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              {/* Other Fees */}
              <form.Field name="otherFees">
                {(field) => (
                  <FormField field={field} label="Other Fees">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value ?? 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        className={isInvalid ? "border-destructive" : ""}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Finance fields + Calculated totals (reactive via Subscribe) */}
            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const isFinancing =
                  values.saleType === "finance" || values.saleType === "bhph"
                const calcs = calculateDeal({
                  sellingPrice: values.sellingPrice ?? 0,
                  tradeAllowance: values.tradeAllowance ?? 0,
                  tradePayoff: values.tradePayoff ?? 0,
                  downPayment: values.downPayment ?? 0,
                  taxRate: values.taxRate ?? 0,
                  titleFee: values.titleFee ?? 0,
                  registrationFee: values.registrationFee ?? 0,
                  docFee: values.docFee ?? 0,
                  otherFees: values.otherFees ?? 0,
                  apr: values.apr ?? 0,
                  term: values.term ?? 0,
                  saleType: values.saleType ?? "cash",
                })

                return (
                  <>
                    {isFinancing && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <form.Field name="apr">
                          {(field) => (
                            <FormField field={field} label="APR (%)">
                              {({ isInvalid, errorId }) => (
                                <Input
                                  id={field.name}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={field.state.value ?? 0}
                                  onChange={(e) =>
                                    field.handleChange(Number(e.target.value))
                                  }
                                  onBlur={field.handleBlur}
                                  aria-invalid={isInvalid}
                                  aria-describedby={
                                    isInvalid ? errorId : undefined
                                  }
                                  className={
                                    isInvalid ? "border-destructive" : ""
                                  }
                                />
                              )}
                            </FormField>
                          )}
                        </form.Field>

                        <form.Field name="term">
                          {(field) => (
                            <FormField field={field} label="Term (months)">
                              {({ isInvalid, errorId }) => (
                                <Input
                                  id={field.name}
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={field.state.value ?? 0}
                                  onChange={(e) =>
                                    field.handleChange(Number(e.target.value))
                                  }
                                  onBlur={field.handleBlur}
                                  aria-invalid={isInvalid}
                                  aria-describedby={
                                    isInvalid ? errorId : undefined
                                  }
                                  className={
                                    isInvalid ? "border-destructive" : ""
                                  }
                                />
                              )}
                            </FormField>
                          )}
                        </form.Field>
                      </div>
                    )}

                    <Separator />

                    {/* Calculated fields (read-only) */}
                    <div className="rounded-md bg-muted/50 p-4">
                      <h4 className="text-sm font-medium mb-3">
                        Calculated Totals
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Net Trade
                          </p>
                          <p className="text-sm font-medium">
                            {fmt.format(calcs.netTrade)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tax Amount
                          </p>
                          <p className="text-sm font-medium">
                            {fmt.format(calcs.taxAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Fees
                          </p>
                          <p className="text-sm font-medium">
                            {fmt.format(calcs.totalFees)}
                          </p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-xs text-muted-foreground">
                            Total Price
                          </p>
                          <p className="text-lg font-bold">
                            {fmt.format(calcs.totalPrice)}
                          </p>
                        </div>
                        {isFinancing && (
                          <>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Amount Financed
                              </p>
                              <p className="text-sm font-medium">
                                {fmt.format(calcs.amountFinanced)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Monthly Payment
                              </p>
                              <p className="text-lg font-bold">
                                {fmt.format(calcs.monthlyPayment)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )
              }}
            </form.Subscribe>

            {/* Notes */}
            <form.Field name="notes">
              {(field) => (
                <FormField field={field} label="Notes">
                  {({ isInvalid, errorId }) => (
                    <Textarea
                      id={field.name}
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                      placeholder="Optional deal notes..."
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={isInvalid ? "border-destructive" : ""}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Save Changes"
                    : "Add Deal"}
              </Button>
            )}
          </form.Subscribe>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push("/admin/deals")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
