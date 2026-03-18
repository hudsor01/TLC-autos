import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch, camelKeys } from "@/lib/utils";

const ALLOWED_SORT = ["date_added", "selling_price", "mileage", "year"];

const SORT_MAP: Record<string, string> = {
  newest: "date_added",
  "price-low": "selling_price",
  "price-high": "selling_price",
  mileage: "mileage",
  year: "year",
};

const ORDER_MAP: Record<string, boolean> = {
  newest: false,
  "price-low": true,
  "price-high": false,
  mileage: true,
  year: false,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = sanitizeSearch(searchParams.get("search") || "");
    const make = searchParams.get("make") || "";
    const model = searchParams.get("model") || "";
    const yearMin = searchParams.get("yearMin")
      ? parseInt(searchParams.get("yearMin")!)
      : null;
    const yearMax = searchParams.get("yearMax")
      ? parseInt(searchParams.get("yearMax")!)
      : null;
    const priceMin = searchParams.get("priceMin")
      ? parseInt(searchParams.get("priceMin")!)
      : null;
    const priceMax = searchParams.get("priceMax")
      ? parseInt(searchParams.get("priceMax")!)
      : null;
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const from = (page - 1) * limit;

    const supabase = await createClient();

    // Build main vehicle query
    let query = supabase
      .from("vehicles")
      .select("*, vehicle_images(url, sort_order)", { count: "exact" });

    // Public only sees available vehicles
    query = query.eq("status", "available");

    if (make) query = query.eq("make", make);
    if (model) query = query.eq("model", model);
    if (yearMin) query = query.gte("year", yearMin);
    if (yearMax) query = query.lte("year", yearMax);
    if (priceMin) query = query.gte("selling_price", priceMin);
    if (priceMax) query = query.lte("selling_price", priceMax);

    if (search) {
      query = query.or(
        `make.ilike.%${search}%,model.ilike.%${search}%`
      );
    }

    // Resolve sort
    const sortColumn = SORT_MAP[sort] || "date_added";
    const validSort = ALLOWED_SORT.includes(sortColumn)
      ? sortColumn
      : "date_added";
    const ascending = ORDER_MAP[sort] ?? false;

    const { data: vehicles, count, error } = await query
      .order(validSort, { ascending })
      .range(from, from + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    // Transform vehicles
    const transformed = (vehicles ?? []).map((v) => {
      const { vehicle_images, ...rest } = v;
      const images = (
        vehicle_images as { url: string; sort_order: number }[] | null
      ) ?? [];
      const sortedImages = [...images]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img) => img.url);
      return {
        ...camelKeys(rest),
        images: sortedImages,
      };
    });

    // Query filter options (distinct values from all available vehicles)
    const { data: optionsData } = await supabase
      .from("vehicles")
      .select("make, model, year, selling_price")
      .eq("status", "available");

    const allVehicles = optionsData ?? [];
    const makes = [...new Set(allVehicles.map((v) => v.make))].sort();

    // If a make is selected, only show models for that make
    const modelsSource = make
      ? allVehicles.filter((v) => v.make === make)
      : allVehicles;
    const models = [...new Set(modelsSource.map((v) => v.model))].sort();

    const years = allVehicles.map((v) => v.year);
    const prices = allVehicles.map((v) => Number(v.selling_price) || 0);

    const filterOptions = {
      makes,
      models,
      yearRange: {
        min: years.length > 0 ? Math.min(...years) : 0,
        max: years.length > 0 ? Math.max(...years) : 0,
      },
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
    };

    return NextResponse.json({
      vehicles: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filterOptions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
