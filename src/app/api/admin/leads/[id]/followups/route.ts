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

    const { data: followUps, error } = await supabase
      .from("follow_ups")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(followUps));
  } catch {
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();

    const dbData = snakeKeys(body);
    dbData.lead_id = id;

    const { data: followUp, error } = await supabase
      .from("follow_ups")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(followUp), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create follow-up" }, { status: 500 });
  }
}
