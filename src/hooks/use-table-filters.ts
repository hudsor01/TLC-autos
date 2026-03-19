"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

interface TableFiltersConfig {
  defaultSort?: string;
  defaultOrder?: string;
  statusOptions?: string[];
}

export function useTableFilters(config?: TableFiltersConfig) {
  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""),
      sort: parseAsString.withDefault(config?.defaultSort ?? "created_at"),
      order: parseAsString.withDefault(config?.defaultOrder ?? "desc"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 300 }
  );
}

export function buildApiParams(
  filters: {
    search: string;
    status: string;
    sort: string;
    order: string;
    page: number;
  },
  limit = 20
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  params.set("sort", filters.sort);
  params.set("order", filters.order);
  params.set("page", String(filters.page));
  params.set("limit", String(limit));
  return params;
}
