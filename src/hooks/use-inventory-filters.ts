"use client";

import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";

export function useInventoryFilters() {
  return useQueryStates(
    {
      search: parseAsString.withDefault(""),
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      yearMin: parseAsInteger,
      yearMax: parseAsInteger,
      priceMin: parseAsInteger,
      priceMax: parseAsInteger,
      sort: parseAsString.withDefault("newest"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 300 }
  );
}
