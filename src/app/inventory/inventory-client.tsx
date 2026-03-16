"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  Gauge,
  Fuel,
  Settings2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/lib/inventory";
import { CONTACT } from "@/lib/constants";

interface FilterOptions {
  makes: string[];
  bodyStyles: string[];
  years: number[];
  priceRanges: { label: string; min: number; max: number }[];
}

interface InventoryClientProps {
  vehicles: Vehicle[];
  filterOptions: FilterOptions;
}

export function InventoryClient({
  vehicles,
  filterOptions,
}: InventoryClientProps) {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => v.status === "available");

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.year.toString().includes(q) ||
          v.trim.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      );
    }

    // Filters
    if (makeFilter) result = result.filter((v) => v.make === makeFilter);
    if (bodyFilter) result = result.filter((v) => v.bodyStyle === bodyFilter);
    if (yearFilter) result = result.filter((v) => v.year === parseInt(yearFilter));
    if (priceFilter) {
      const range = filterOptions.priceRanges[parseInt(priceFilter)];
      if (range) result = result.filter((v) => v.price >= range.min && v.price < range.max);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "mileage":
        result.sort((a, b) => a.mileage - b.mileage);
        break;
      case "year":
        result.sort((a, b) => b.year - a.year);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
    }

    return result;
  }, [vehicles, search, makeFilter, bodyFilter, yearFilter, priceFilter, sortBy, filterOptions]);

  const hasActiveFilters = makeFilter || bodyFilter || yearFilter || priceFilter;

  const clearFilters = () => {
    setMakeFilter("");
    setBodyFilter("");
    setYearFilter("");
    setPriceFilter("");
    setSearch("");
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
              value={makeFilter}
              onChange={(e) => setMakeFilter(e.target.value)}
            >
              <option value="">All Makes</option>
              {filterOptions.makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </Select>
            <Select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
            >
              <option value="">All Body Styles</option>
              {filterOptions.bodyStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </Select>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              {filterOptions.years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>
            <Select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">All Prices</option>
              {filterOptions.priceRanges.map((range, i) => (
                <option key={range.label} value={i.toString()}>
                  {range.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {makeFilter && (
                <Badge variant="secondary" className="gap-1">
                  {makeFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setMakeFilter("")}
                  />
                </Badge>
              )}
              {bodyFilter && (
                <Badge variant="secondary" className="gap-1">
                  {bodyFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setBodyFilter("")}
                  />
                </Badge>
              )}
              {yearFilter && (
                <Badge variant="secondary" className="gap-1">
                  {yearFilter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setYearFilter("")}
                  />
                </Badge>
              )}
              {priceFilter && (
                <Badge variant="secondary" className="gap-1">
                  {filterOptions.priceRanges[parseInt(priceFilter)]?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriceFilter("")}
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
          Showing {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Vehicle Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
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

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] bg-muted">
        {vehicle.images.length > 0 ? (
          <img
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <Badge className="absolute right-2 top-2" variant="secondary">
          {vehicle.bodyStyle}
        </Badge>
      </div>

      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-muted-foreground">{vehicle.trim}</p>

        <p className="mt-2 text-2xl font-bold text-primary">
          ${vehicle.price.toLocaleString()}
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
