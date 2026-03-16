/**
 * Inventory data layer — replaces the Frazer CRM integration.
 * Reads from the local Prisma/SQLite database instead of an external feed.
 */

import { prisma } from "@/lib/db";

/**
 * Public-facing Vehicle type — matches the original interface
 * used by inventory pages and the public API.
 */
export interface Vehicle {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  price: number;
  description: string;
  images: string[];
  status: "available" | "pending" | "sold";
  transmission: string;
  engine: string;
  drivetrain: string;
  fuelType: string;
  features: string[];
  dateAdded: string;
}

/**
 * Fetch all available inventory for the public-facing site.
 */
export async function fetchInventory(): Promise<Vehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "available" },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { dateAdded: "desc" },
  });

  return vehicles.map((v) => ({
    id: v.id,
    stockNumber: v.stockNumber,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    bodyStyle: v.bodyStyle,
    exteriorColor: v.exteriorColor,
    interiorColor: v.interiorColor,
    mileage: v.mileage,
    price: v.sellingPrice,
    description: v.description,
    images: v.images.map((img) => img.url),
    status: v.status as "available" | "pending" | "sold",
    transmission: v.transmission,
    engine: v.engine,
    drivetrain: v.drivetrain,
    fuelType: v.fuelType,
    features: JSON.parse(v.features) as string[],
    dateAdded: v.dateAdded.toISOString().split("T")[0],
  }));
}

/**
 * Fetch a single vehicle by ID (for detail pages).
 */
export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const v = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!v) return null;

  return {
    id: v.id,
    stockNumber: v.stockNumber,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    bodyStyle: v.bodyStyle,
    exteriorColor: v.exteriorColor,
    interiorColor: v.interiorColor,
    mileage: v.mileage,
    price: v.sellingPrice,
    description: v.description,
    images: v.images.map((img) => img.url),
    status: v.status as "available" | "pending" | "sold",
    transmission: v.transmission,
    engine: v.engine,
    drivetrain: v.drivetrain,
    fuelType: v.fuelType,
    features: JSON.parse(v.features) as string[],
    dateAdded: v.dateAdded.toISOString().split("T")[0],
  };
}

/**
 * Get unique values for filter dropdowns.
 */
export function getFilterOptions(vehicles: Vehicle[]) {
  return {
    makes: [...new Set(vehicles.map((v) => v.make))].sort(),
    bodyStyles: [...new Set(vehicles.map((v) => v.bodyStyle))].sort(),
    years: [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a),
    priceRanges: [
      { label: "Under $20,000", min: 0, max: 20000 },
      { label: "$20,000 - $30,000", min: 20000, max: 30000 },
      { label: "$30,000 - $40,000", min: 30000, max: 40000 },
      { label: "$40,000+", min: 40000, max: Infinity },
    ],
  };
}
