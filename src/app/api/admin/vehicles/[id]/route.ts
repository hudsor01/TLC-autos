import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { camelKeys, snakeKeys } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_images(id, url, alt, is_primary, sort_order),
        vehicle_costs(id, description, amount, vendor, date, category, created_at),
        deals(id, deal_number, sale_date, status, total_price, customers(id, first_name, last_name))
      `)
      .eq("id", id)
      .single();

    if (error || !vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(camelKeys(vehicle));
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    // Recalculate total cost if cost fields are being updated
    if (
      body.purchasePrice !== undefined ||
      body.buyerFee !== undefined ||
      body.lotFee !== undefined ||
      body.addedCosts !== undefined
    ) {
      const { data: existing } = await supabase
        .from("vehicles")
        .select("purchase_price, buyer_fee, lot_fee, added_costs")
        .eq("id", id)
        .single();

      if (existing) {
        body.totalCost =
          (body.purchasePrice ?? Number(existing.purchase_price)) +
          (body.buyerFee ?? Number(existing.buyer_fee)) +
          (body.lotFee ?? Number(existing.lot_fee)) +
          (body.addedCosts ?? Number(existing.added_costs));
      }
    }

    // If marking as sold, set dateSold
    if (body.status === "sold" && !body.dateSold) {
      body.dateSold = new Date().toISOString();
    }

    const dbData = snakeKeys(body);

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(vehicle));
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
