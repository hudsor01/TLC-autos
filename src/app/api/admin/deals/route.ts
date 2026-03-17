import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { camelKeys, snakeKeys } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    let query = supabase
      .from("deals")
      .select(
        "*, vehicles(id, year, make, model, stock_number), customers(id, first_name, last_name)",
        { count: "exact" }
      );

    if (status) {
      query = query.eq("status", status);
    }

    const { data: deals, count, error } = await query
      .order("sale_date", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    const transformed = (deals ?? []).map((d) => {
      const { vehicles, customers, ...rest } = d;
      return {
        ...camelKeys(rest),
        vehicle: vehicles ? camelKeys(vehicles) : null,
        customer: customers ? camelKeys(customers) : null,
      };
    });

    return NextResponse.json({
      deals: transformed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    // Auto-generate deal number
    if (!body.dealNumber) {
      const { data: last } = await supabase
        .from("deals")
        .select("deal_number")
        .order("deal_number", { ascending: false })
        .limit(1)
        .single();

      const lastNum = last
        ? parseInt(last.deal_number.replace(/\D/g, "")) || 0
        : 0;
      body.dealNumber = `D-${String(lastNum + 1).padStart(4, "0")}`;
    }

    // Calculate tax amount
    const taxableAmount = (body.sellingPrice || 0) - (body.tradeAllowance || 0);
    body.taxAmount = Math.max(0, taxableAmount) * ((body.taxRate || 6.25) / 100);

    // Calculate total price
    body.totalPrice =
      (body.sellingPrice || 0) -
      (body.tradeAllowance || 0) +
      (body.tradePayoff || 0) +
      body.taxAmount +
      (body.titleFee || 0) +
      (body.registrationFee || 0) +
      (body.docFee || 0) +
      (body.otherFees || 0);

    // Calculate amount financed
    body.amountFinanced = body.totalPrice - (body.downPayment || 0);

    // Calculate monthly payment if financing
    if (body.saleType !== "cash" && body.apr > 0 && body.term > 0) {
      const monthlyRate = body.apr / 100 / 12;
      body.monthlyPayment =
        (body.amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, body.term)) /
        (Math.pow(1 + monthlyRate, body.term) - 1);
      body.monthlyPayment = Math.round(body.monthlyPayment * 100) / 100;
    }

    const dbData = snakeKeys(body);

    const { data: deal, error } = await supabase
      .from("deals")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update vehicle status to pending
    if (body.vehicleId) {
      await supabase
        .from("vehicles")
        .update({ status: "pending" })
        .eq("id", body.vehicleId);
    }

    return NextResponse.json(camelKeys(deal), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
