import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Recursively convert snake_case keys to camelCase (for Supabase → frontend). */
export function camelKeys<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(camelKeys) as T;
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    result[camelKey] = camelKeys(value);
  }
  return result as T;
}

/**
 * Sanitize a search string for use in PostgREST .or() filters.
 * Strips characters that could manipulate filter syntax (commas, dots, parens, etc.).
 */
export function sanitizeSearch(input: string): string {
  return input.replace(/[,.()"'\\]/g, "").trim().slice(0, 200);
}

/** Convert camelCase keys to snake_case (for frontend → Supabase). Non-recursive. */
export function snakeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}
