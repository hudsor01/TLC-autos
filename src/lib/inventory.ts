/**
 * Inventory data layer — public-facing vehicle queries via Supabase.
 */

import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(url, sort_order)")
    .eq("status", "available")
    .order("date_added", { ascending: false });

  if (error) throw error;
  if (!vehicles) return [];

  return vehicles.map((v) => ({
    id: v.id,
    stockNumber: v.stock_number,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? "",
    bodyStyle: v.body_style ?? "",
    exteriorColor: v.exterior_color ?? "",
    interiorColor: v.interior_color ?? "",
    mileage: v.mileage ?? 0,
    price: Number(v.selling_price) || 0,
    description: v.description ?? "",
    images: (v.vehicle_images ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((img: { url: string }) => img.url),
    status: v.status as "available" | "pending" | "sold",
    transmission: v.transmission ?? "",
    engine: v.engine ?? "",
    drivetrain: v.drivetrain ?? "",
    fuelType: v.fuel_type ?? "",
    features: Array.isArray(v.features) ? v.features as string[] : [],
    dateAdded: v.date_added
      ? new Date(v.date_added).toISOString().split("T")[0]
      : "",
  }));
}

/**
 * Fetch a single vehicle by ID (for detail pages).
 */
export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();

  const { data: v, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(url, sort_order)")
    .eq("id", id)
    .single();

  if (error || !v) return null;

  return {
    id: v.id,
    stockNumber: v.stock_number,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? "",
    bodyStyle: v.body_style ?? "",
    exteriorColor: v.exterior_color ?? "",
    interiorColor: v.interior_color ?? "",
    mileage: v.mileage ?? 0,
    price: Number(v.selling_price) || 0,
    description: v.description ?? "",
    images: (v.vehicle_images ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((img: { url: string }) => img.url),
    status: v.status as "available" | "pending" | "sold",
    transmission: v.transmission ?? "",
    engine: v.engine ?? "",
    drivetrain: v.drivetrain ?? "",
    fuelType: v.fuel_type ?? "",
    features: Array.isArray(v.features) ? v.features as string[] : [],
    dateAdded: v.date_added
      ? new Date(v.date_added).toISOString().split("T")[0]
      : "",
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
