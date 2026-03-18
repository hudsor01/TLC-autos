"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { Label } from "@/components/ui/label"

export function getFieldErrors(field: AnyFieldApi): string[] {
  return field.state.meta.errors.map((err: unknown) =>
    typeof err === "string" ? err : (err as { message: string }).message
  )
}

interface FormFieldProps {
  field: AnyFieldApi
  label: string
  children: (props: { isInvalid: boolean; errorId: string }) => React.ReactNode
}

export function FormField({ field, label, children }: FormFieldProps) {
  const errors = getFieldErrors(field)
  const isInvalid = field.state.meta.isTouched && errors.length > 0
  const errorId = `${field.name}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      {children({ isInvalid, errorId })}
      {isInvalid && (
        <p id={errorId} className="text-xs text-destructive mt-1">
          {errors[0]}
        </p>
      )}
    </div>
  )
}
