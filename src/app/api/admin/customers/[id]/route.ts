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

    const { data: customer, error } = await supabase
      .from("customers")
      .select(`
        *,
        deals(*, vehicles(id, year, make, model, stock_number)),
        leads(*)
      `)
      .eq("id", id)
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(camelKeys(customer));
  } catch {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;
    const dbData = snakeKeys(body);

    const { data: customer, error } = await supabase
      .from("customers")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(customer));
  } catch {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
