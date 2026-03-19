"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { customerSchema, type CustomerFormValues } from "@/lib/schemas"
import { FormField } from "@/components/admin/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface CustomerFormProps {
  initialData?: CustomerFormValues & { id?: string }
}

export default function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: initialData ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      driversLicense: "",
      notes: "",
    },
    validators: {
      onSubmit: customerSchema,
      onBlur: customerSchema,
    },
    onSubmit: async ({ value }) => {
      const url = isEdit
        ? `/api/admin/customers/${initialData!.id}`
        : "/api/admin/customers"
      const method = isEdit ? "PUT" : "POST"

      await toast.promise(
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Failed to save customer")
          }
          return res.json()
        }),
        {
          loading: "Saving...",
          success: () => {
            router.push("/admin/customers")
            return isEdit ? "Customer updated" : "Customer created"
          },
          error: (err) => (err as Error).message,
        }
      )
    },
  })

  // Dirty form beforeunload protection
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.state.isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [form.state.isDirty])

  // Scroll to first error on submit failure
  useEffect(() => {
    if (form.state.submissionAttempts > 0 && form.state.canSubmit === false) {
      const firstError = formRef.current?.querySelector("[data-invalid='true'], .text-destructive")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [form.state.submissionAttempts, form.state.canSubmit])

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Customer" : "Add Customer"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {/* Row: First Name, Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="firstName">
                {(field) => (
                  <FormField field={field} label="First Name *">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                        autoFocus
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="lastName">
                {(field) => (
                  <FormField field={field} label="Last Name *">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Row: Email, Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="email">
                {(field) => (
                  <FormField field={field} label="Email">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <FormField field={field} label="Phone">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Address (full-width) */}
            <form.Field name="address">
              {(field) => (
                <FormField field={field} label="Address">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      data-invalid={isInvalid || undefined}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            {/* Row: City, State */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="city">
                {(field) => (
                  <FormField field={field} label="City">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="state">
                {(field) => (
                  <FormField field={field} label="State">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Row: Zip, Driver's License */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="zip">
                {(field) => (
                  <FormField field={field} label="Zip">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="driversLicense">
                {(field) => (
                  <FormField field={field} label="Driver's License">
                    {({ isInvalid, errorId }) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      />
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Notes (full-width) */}
            <form.Field name="notes">
              {(field) => (
                <FormField field={field} label="Notes">
                  {({ isInvalid, errorId }) => (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      data-invalid={isInvalid || undefined}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
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
                      "Add Customer"
                    )}
                  </Button>
                )}
              </form.Subscribe>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/customers")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
