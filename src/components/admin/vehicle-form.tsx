"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { vehicleSchema, type VehicleFormValues } from "@/lib/schemas"
import { FormField } from "@/components/admin/form-field"
import { ImageManager, type VehicleImage } from "@/components/admin/image-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface VehicleFormProps {
  initialData?: VehicleFormValues & { id?: string; images?: VehicleImage[] }
}

export default function VehicleForm({ initialData }: VehicleFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [images, setImages] = useState<VehicleImage[]>(initialData?.images ?? [])
  const beforeUnloadRef = useRef(false)

  const form = useForm({
    defaultValues: initialData ?? {
      stockNumber: "",
      vin: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      trim: "",
      bodyStyle: "",
      vehicleType: "",
      exteriorColor: "",
      interiorColor: "",
      mileage: 0,
      mileageType: "Actual",
      fuelType: "",
      transmission: "",
      engine: "",
      cylinders: 0,
      drivetrain: "",
      description: "",
      purchasePrice: 0,
      buyerFee: 0,
      lotFee: 0,
      sellingPrice: 0,
      status: "available",
      locationCode: "",
      features: "",
    } satisfies VehicleFormValues,
    validators: {
      onSubmit: vehicleSchema,
      onBlur: vehicleSchema,
    },
    onSubmit: async ({ value }) => {
      const url = isEdit
        ? `/api/admin/vehicles/${initialData!.id}`
        : "/api/admin/vehicles"
      const method = isEdit ? "PUT" : "POST"

      await toast.promise(
        (async () => {
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => null)
            if (res.status === 400 && data?.fieldErrors) {
              for (const [field, message] of Object.entries(data.fieldErrors)) {
                form.setFieldMeta(field as keyof VehicleFormValues, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    onSubmit: message as string,
                  },
                }))
              }
              throw new Error("Validation failed")
            }
            throw new Error(data?.error ?? "Something went wrong. Please try again.")
          }

          // Remove beforeunload before navigating
          beforeUnloadRef.current = false
          router.push("/admin/vehicles")
        })(),
        {
          loading: "Saving...",
          success: isEdit ? "Changes saved" : "Vehicle added successfully",
          error: (err) =>
            err instanceof Error && err.message !== "Validation failed"
              ? err.message
              : "Something went wrong. Please try again.",
        },
      )
    },
    onSubmitInvalid: () => {
      // Scroll to first error
      requestAnimationFrame(() => {
        const firstError = document.querySelector("[aria-invalid=true]")
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    },
  })

  // beforeunload effect
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (beforeUnloadRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  // Track dirty state for beforeunload
  useEffect(() => {
    const sub = form.store.subscribe(() => {
      beforeUnloadRef.current = form.state.isDirty
    })
    return () => sub.unsubscribe()
  }, [form])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? "Edit Vehicle" : "Add Vehicle"}
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <form.Field name="make">
              {(field) => (
                <FormField field={field} label="Make">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      aria-required
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="model">
              {(field) => (
                <FormField field={field} label="Model">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      aria-required
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="year">
              {(field) => (
                <FormField field={field} label="Year">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      aria-required
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="vin">
              {(field) => (
                <FormField field={field} label="VIN">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      aria-required
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="stockNumber">
              {(field) => (
                <FormField field={field} label="Stock Number">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      aria-required
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="mileage">
              {(field) => (
                <FormField field={field} label="Mileage">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="mileageType">
              {(field) => (
                <FormField field={field} label="Mileage Type">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="Actual">Actual</option>
                      <option value="Exempt">Exempt</option>
                      <option value="TMU">TMU</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="bodyStyle">
              {(field) => (
                <FormField field={field} label="Body Style">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="exteriorColor">
              {(field) => (
                <FormField field={field} label="Exterior Color">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="interiorColor">
              {(field) => (
                <FormField field={field} label="Interior Color">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="transmission">
              {(field) => (
                <FormField field={field} label="Transmission">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="">Select...</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="fuelType">
              {(field) => (
                <FormField field={field} label="Fuel Type">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="">Select...</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="drivetrain">
              {(field) => (
                <FormField field={field} label="Drivetrain">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="">Select...</option>
                      <option value="FWD">FWD</option>
                      <option value="RWD">RWD</option>
                      <option value="AWD">AWD</option>
                      <option value="4WD">4WD</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="engine">
              {(field) => (
                <FormField field={field} label="Engine">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="cylinders">
              {(field) => (
                <FormField field={field} label="Cylinders">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="vehicleType">
              {(field) => (
                <FormField field={field} label="Vehicle Type">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="">Select...</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Wagon">Wagon</option>
                      <option value="Other">Other</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <FormField field={field} label="Status">
                  {({ isInvalid, errorId }) => (
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </Select>
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="locationCode">
              {(field) => (
                <FormField field={field} label="Location Code">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Pricing & Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing & Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <form.Field name="sellingPrice">
              {(field) => (
                <FormField field={field} label="Selling Price">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="purchasePrice">
              {(field) => (
                <FormField field={field} label="Purchase Price">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="buyerFee">
              {(field) => (
                <FormField field={field} label="Buyer Fee">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="lotFee">
              {(field) => (
                <FormField field={field} label="Lot Fee">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Description & Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.Field name="description">
              {(field) => (
                <FormField field={field} label="Description">
                  {({ isInvalid, errorId }) => (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={5}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            <form.Field name="features">
              {(field) => (
                <FormField field={field} label="Features">
                  {({ isInvalid, errorId }) => (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                      placeholder="Comma-separated: Bluetooth, Backup Camera, Heated Seats"
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      className={cn(isInvalid && "border-destructive")}
                    />
                  )}
                </FormField>
              )}
            </form.Field>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
          </CardHeader>
          <CardContent>
            {isEdit && initialData?.id ? (
              <ImageManager
                vehicleId={initialData.id}
                images={images}
                onImagesChange={setImages}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Save the vehicle first, then add images.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/vehicles")}
          >
            Cancel
          </Button>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}
