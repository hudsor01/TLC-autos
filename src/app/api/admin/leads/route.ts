import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { validateRequest } from "@/lib/api-validation";
import { leadSchema } from "@/lib/schemas";
import { camelKeys, sanitizeSearch, snakeKeys } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = sanitizeSearch(searchParams.get("search") || "");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    let query = supabase
      .from("leads")
      .select(
        "*, customers(id, first_name, last_name), follow_ups(count)",
        { count: "exact" }
      );

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,vehicle_interest.ilike.%${search}%`
      );
    }

    const sortBy = searchParams.get("sort") || "created_at";
    const sortOrder = searchParams.get("order") || "desc";
    const ALLOWED_SORT = ["created_at", "first_name", "last_name", "status", "source"];
    const validSort = ALLOWED_SORT.includes(sortBy) ? sortBy : "created_at";

    const { data: leads, count, error } = await query
      .order(validSort, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    const transformed = (leads ?? []).map((l) => {
      const { follow_ups, customers, ...rest } = l;
      return {
        ...camelKeys(rest),
        customer: customers ? camelKeys(customers) : null,
        _count: {
          followUps: (follow_ups as { count: number }[])?.[0]?.count ?? 0,
        },
      };
    });

    return NextResponse.json({
      leads: transformed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const validation = validateRequest(leadSchema, body);
    if (!validation.success) return validation.response;
    const dbData = snakeKeys(validation.data);

    const { data: lead, error } = await supabase
      .from("leads")
      .insert(dbData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(lead), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
