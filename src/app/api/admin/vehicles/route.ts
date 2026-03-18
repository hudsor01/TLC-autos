import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { validateRequest } from "@/lib/api-validation";
import { vehicleSchema } from "@/lib/schemas";
import { camelKeys, sanitizeSearch, snakeKeys } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = sanitizeSearch(searchParams.get("search") || "");
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    let query = supabase
      .from("vehicles")
      .select("*, vehicle_images(url, alt, is_primary, sort_order)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `make.ilike.%${search}%,model.ilike.%${search}%,stock_number.ilike.%${search}%,vin.ilike.%${search}%`
      );
    }

    const sortBy = searchParams.get("sort") || "date_added";
    const sortOrder = searchParams.get("order") || "desc";
    const ALLOWED_SORT = ["date_added", "year", "make", "model", "selling_price", "status", "stock_number", "mileage"];
    const validSort = ALLOWED_SORT.includes(sortBy) ? sortBy : "date_added";

    const { data: vehicles, count, error } = await query
      .order(validSort, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    // Transform: extract primary image, convert to camelCase
    const transformed = (vehicles ?? []).map((v) => {
      const { vehicle_images, ...rest } = v;
      const images = vehicle_images as { url: string; alt: string; is_primary: boolean; sort_order: number }[];
      const primary = images?.find((img) => img.is_primary) ?? images?.[0];
      return {
        ...camelKeys(rest),
        images: primary ? [{ url: primary.url, alt: primary.alt }] : [],
      };
    });

    return NextResponse.json({
      vehicles: transformed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const validation = validateRequest(vehicleSchema, body);
    if (!validation.success) return validation.response;
    const validatedBody = validation.data;

    // Auto-generate stock number if not provided
    if (!validatedBody.stockNumber) {
      const { data: last } = await supabase
        .from("vehicles")
        .select("stock_number")
        .order("stock_number", { ascending: false })
        .limit(1)
        .single();

      const lastNum = last
        ? parseInt(last.stock_number.replace(/\D/g, "")) || 0
        : 0;
      validatedBody.stockNumber = `TLC-${String(lastNum + 1).padStart(3, "0")}`;
    }

    // Calculate total cost
    const totalCost =
      (validatedBody.purchasePrice || 0) +
      (validatedBody.buyerFee || 0) +
      (validatedBody.lotFee || 0);

    const dbData = snakeKeys({ ...validatedBody, totalCost });

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert(dbData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(vehicle), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
