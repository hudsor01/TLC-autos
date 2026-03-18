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

    const { data: costs, error } = await supabase
      .from("vehicle_costs")
      .select("*")
      .eq("vehicle_id", id)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(costs));
  } catch {
    return NextResponse.json({ error: "Failed to fetch costs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const dbData = snakeKeys(body);
    dbData.vehicle_id = id;

    const { data: cost, error } = await supabase
      .from("vehicle_costs")
      .insert(dbData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the vehicle's added_costs total
    const { data: allCosts } = await supabase
      .from("vehicle_costs")
      .select("amount")
      .eq("vehicle_id", id);

    const addedCosts = (allCosts ?? []).reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("purchase_price, buyer_fee, lot_fee")
      .eq("id", id)
      .single();

    if (vehicle) {
      await supabase
        .from("vehicles")
        .update({
          added_costs: addedCosts,
          total_cost:
            Number(vehicle.purchase_price) +
            Number(vehicle.buyer_fee) +
            Number(vehicle.lot_fee) +
            addedCosts,
        })
        .eq("id", id);
    }

    return NextResponse.json(camelKeys(cost), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create cost" }, { status: 500 });
  }
}
