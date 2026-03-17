import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { camelKeys, snakeKeys } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: deal, error } = await supabase
      .from("deals")
      .select("*, vehicles(*), customers(*)")
      .eq("id", id)
      .single();

    if (error || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const { vehicles, customers, ...rest } = deal;
    return NextResponse.json({
      ...camelKeys(rest),
      vehicle: vehicles ? camelKeys(vehicles) : null,
      customer: customers ? camelKeys(customers) : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();

    // Handle status transitions
    if (body.status === "completed" || body.status === "voided") {
      const { data: existing } = await supabase
        .from("deals")
        .select("vehicle_id")
        .eq("id", id)
        .single();

      if (existing) {
        if (body.status === "completed") {
          await supabase
            .from("vehicles")
            .update({ status: "sold", date_sold: new Date().toISOString() })
            .eq("id", existing.vehicle_id);
        } else {
          await supabase
            .from("vehicles")
            .update({ status: "available", date_sold: null })
            .eq("id", existing.vehicle_id);
        }
      }
    }

    const dbData = snakeKeys(body);

    const { data: deal, error } = await supabase
      .from("deals")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(deal));
  } catch {
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Set vehicle back to available
    const { data: deal } = await supabase
      .from("deals")
      .select("vehicle_id")
      .eq("id", id)
      .single();

    if (deal) {
      await supabase
        .from("vehicles")
        .update({ status: "available", date_sold: null })
        .eq("id", deal.vehicle_id);
    }

    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}
