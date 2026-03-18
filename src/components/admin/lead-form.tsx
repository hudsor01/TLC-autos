"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { leadSchema, type LeadFormValues } from "@/lib/schemas"
import { FormField } from "@/components/admin/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface LeadFormProps {
  initialData?: LeadFormValues & { id?: string }
}

export default function LeadForm({ initialData }: LeadFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm({
    defaultValues: initialData ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "",
      status: "new",
      vehicleInterest: "",
      notes: "",
      customerId: "",
    },
    validators: {
      onSubmit: leadSchema,
      onBlur: leadSchema,
    },
    onSubmit: async ({ value }) => {
      const url = isEdit
        ? `/api/admin/leads/${initialData!.id}`
        : "/api/admin/leads"
      const method = isEdit ? "PUT" : "POST"

      await toast.promise(
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Failed to save lead")
          }
          return res.json()
        }),
        {
          loading: "Saving...",
          success: () => {
            router.push("/admin/leads")
            return isEdit ? "Lead updated" : "Lead created"
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
          <CardTitle>{isEdit ? "Edit Lead" : "Add Lead"}</CardTitle>
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
                  <FormField field={field} label="First Name">
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
                        autoFocus
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="lastName">
                {(field) => (
                  <FormField field={field} label="Last Name">
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

            {/* Row: Source, Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="source">
                {(field) => (
                  <FormField field={field} label="Source">
                    {({ isInvalid, errorId }) => (
                      <Select
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      >
                        <option value="">Select source...</option>
                        <option value="walk-in">Walk-in</option>
                        <option value="phone">Phone</option>
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="other">Other</option>
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
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? errorId : undefined}
                        data-invalid={isInvalid || undefined}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="lost">Lost</option>
                        <option value="converted">Converted</option>
                      </Select>
                    )}
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Vehicle Interest (full-width) */}
            <form.Field name="vehicleInterest">
              {(field) => (
                <FormField field={field} label="Vehicle Interest">
                  {({ isInvalid, errorId }) => (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., 2024 Toyota Camry, SUV under $30k"
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      data-invalid={isInvalid || undefined}
                    />
                  )}
                </FormField>
              )}
            </form.Field>

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
                      "Add Lead"
                    )}
                  </Button>
                )}
              </form.Subscribe>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/leads")}
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
