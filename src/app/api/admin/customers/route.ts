import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { camelKeys, snakeKeys } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    let query = supabase
      .from("customers")
      .select("*, deals(count), leads(count)", { count: "exact" });

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data: customers, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    // Transform relation counts to match Prisma's _count format
    const transformed = (customers ?? []).map((c) => {
      const { deals, leads, ...rest } = c;
      return {
        ...camelKeys(rest),
        _count: {
          deals: (deals as { count: number }[])?.[0]?.count ?? 0,
          leads: (leads as { count: number }[])?.[0]?.count ?? 0,
        },
      };
    });

    return NextResponse.json({
      customers: transformed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const dbData = snakeKeys(body);

    const { data: customer, error } = await supabase
      .from("customers")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(customer), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
