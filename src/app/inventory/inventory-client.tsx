"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  Gauge,
  Fuel,
  Settings2,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTACT } from "@/lib/constants";
import { useInventoryFilters } from "@/hooks/use-inventory-filters";

interface InventoryVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  mileage: number;
  sellingPrice: number;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  images: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterOpts {
  makes: string[];
  models: string[];
  yearRange: { min: number; max: number };
  priceRange: { min: number; max: number };
}

interface InventoryData {
  vehicles: InventoryVehicle[];
  pagination: Pagination;
  filterOptions: FilterOpts;
}

export function InventoryClient() {
  const [filters, setFilters] = useInventoryFilters();
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.make) params.set("make", filters.make);
      if (filters.model) params.set("model", filters.model);
      if (filters.yearMin) params.set("yearMin", String(filters.yearMin));
      if (filters.yearMax) params.set("yearMax", String(filters.yearMax));
      if (filters.priceMin) params.set("priceMin", String(filters.priceMin));
      if (filters.priceMax) params.set("priceMax", String(filters.priceMax));
      if (filters.sort && filters.sort !== "newest")
        params.set("sort", filters.sort);
      params.set("page", String(filters.page));

      const res = await fetch(`/api/inventory?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      // Silently handle -- data stays null showing empty state
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate year options from filter range
  const yearOptions: number[] = [];
  if (data?.filterOptions.yearRange) {
    const { min, max } = data.filterOptions.yearRange;
    for (let y = max; y >= min; y--) {
      yearOptions.push(y);
    }
  }

  const hasActiveFilters =
    filters.make ||
    filters.model ||
    filters.yearMin ||
    filters.yearMax ||
    filters.priceMin ||
    filters.priceMax ||
    filters.search;

  const clearFilters = () => {
    setFilters({
      search: "",
      make: "",
      model: "",
      yearMin: null,
      yearMax: null,
      priceMin: null,
      priceMax: null,
      sort: "newest",
      page: 1,
    });
  };

  // Find the active price range label for badges
  const activePriceLabel = (() => {
    if (!filters.priceMin && !filters.priceMax) return null;
    if (filters.priceMax && !filters.priceMin)
      return `Under $${(filters.priceMax / 1000).toFixed(0)}k`;
    if (filters.priceMin && !filters.priceMax)
      return `$${(filters.priceMin / 1000).toFixed(0)}k+`;
    if (filters.priceMin && filters.priceMax)
      return `$${(filters.priceMin / 1000).toFixed(0)}k - $${(filters.priceMax / 1000).toFixed(0)}k`;
    return null;
  })();

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Search and Sort Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by make, model..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ search: e.target.value, page: 1 })
                }
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ sort: e.target.value, page: 1 })
                }
                className="w-[180px]"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="mileage">Lowest Mileage</option>
                <option value="year">Newest Year</option>
              </Select>
            </div>
          </div>

          {/* Filter dropdowns */}
          <div
            className={`grid gap-3 sm:grid-cols-2 md:grid-cols-4 ${
              showFilters ? "block" : "hidden sm:grid"
            }`}
          >
            <Select
              value={filters.make}
              onChange={(e) =>
                setFilters({ make: e.target.value, model: "", page: 1 })
              }
            >
              <option value="">All Makes</option>
              {(data?.filterOptions.makes ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <Select
              value={filters.model}
              onChange={(e) =>
                setFilters({ model: e.target.value, page: 1 })
              }
            >
              <option value="">All Models</option>
              {(data?.filterOptions.models ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Select
                value={filters.yearMin?.toString() ?? ""}
                onChange={(e) =>
                  setFilters({
                    yearMin: e.target.value ? parseInt(e.target.value) : null,
                    page: 1,
                  })
                }
              >
                <option value="">Year From</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </Select>
              <Select
                value={filters.yearMax?.toString() ?? ""}
                onChange={(e) =>
                  setFilters({
                    yearMax: e.target.value ? parseInt(e.target.value) : null,
                    page: 1,
                  })
                }
              >
                <option value="">Year To</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>
            <Select
              value={
                filters.priceMin && filters.priceMax
                  ? `${filters.priceMin}-${filters.priceMax}`
                  : filters.priceMax
                    ? `0-${filters.priceMax}`
                    : filters.priceMin
                      ? `${filters.priceMin}-`
                      : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setFilters({ priceMin: null, priceMax: null, page: 1 });
                } else {
                  const [min, max] = val.split("-");
                  setFilters({
                    priceMin: min ? parseInt(min) : null,
                    priceMax: max ? parseInt(max) : null,
                    page: 1,
                  });
                }
              }}
            >
              <option value="">All Prices</option>
              <option value="0-15000">Under $15k</option>
              <option value="15000-25000">$15k - $25k</option>
              <option value="25000-35000">$25k - $35k</option>
              <option value="35000-">$35k+</option>
            </Select>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{filters.search}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters({ search: "", page: 1 })}
                  />
                </Badge>
              )}
              {filters.make && (
                <Badge variant="secondary" className="gap-1">
                  {filters.make}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters({ make: "", model: "", page: 1 })
                    }
                  />
                </Badge>
              )}
              {filters.model && (
                <Badge variant="secondary" className="gap-1">
                  {filters.model}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters({ model: "", page: 1 })}
                  />
                </Badge>
              )}
              {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="gap-1">
                  {filters.yearMin && filters.yearMax
                    ? `${filters.yearMin} - ${filters.yearMax}`
                    : filters.yearMin
                      ? `${filters.yearMin}+`
                      : `Up to ${filters.yearMax}`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters({ yearMin: null, yearMax: null, page: 1 })
                    }
                  />
                </Badge>
              )}
              {activePriceLabel && (
                <Badge variant="secondary" className="gap-1">
                  {activePriceLabel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setFilters({ priceMin: null, priceMax: null, page: 1 })
                    }
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted-foreground">
          {loading
            ? "Loading vehicles..."
            : `Showing ${data?.vehicles.length ?? 0} of ${data?.pagination.total ?? 0} vehicle${(data?.pagination.total ?? 0) !== 1 ? "s" : ""}`}
        </p>

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-7 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && data && data.vehicles.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && data && data.vehicles.length === 0 && (
          <div className="py-20 text-center">
            <Car className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No vehicles found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ page: filters.page - 1 })}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= data.pagination.totalPages}
              onClick={() => setFilters({ page: filters.page + 1 })}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Frazer CRM Integration Notice */}
        <div className="mt-16 rounded-lg border border-border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Inventory is synced with our dealership management system and updated
            regularly. Prices and availability are subject to change. Call us at{" "}
            <a
              href={`tel:${CONTACT.phone}`}
              className="font-medium text-primary hover:underline"
            >
              {CONTACT.phone}
            </a>{" "}
            to confirm availability.
          </p>
        </div>
      </div>
    </section>
  );
}

function VehicleCard({ vehicle }: { vehicle: InventoryVehicle }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {vehicle.images.length > 0 ? (
          <Image
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <Car className="h-16 w-16 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/50">
              No photos available
            </span>
          </div>
        )}
        {vehicle.bodyStyle && (
          <Badge className="absolute right-2 top-2" variant="secondary">
            {vehicle.bodyStyle}
          </Badge>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.trim && (
          <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
        )}

        <p className="mt-2 text-2xl font-bold text-primary">
          ${vehicle.sellingPrice.toLocaleString()}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {vehicle.mileage.toLocaleString()} mi
          </div>
          <div className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {vehicle.transmission}
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {vehicle.fuelType}
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3.5 w-3.5" />
            {vehicle.drivetrain}
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/inventory/${vehicle.id}`}>View Details</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <a href={`tel:${CONTACT.phone}`}>Call Us</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
