import { z } from "zod"
import { NextResponse } from "next/server"

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message
      }
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}
