import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public endpoint for creating leads from the contact form.
 * No authentication required — RLS policy allows public inserts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        first_name: String(body.firstName || "").slice(0, 100),
        last_name: String(body.lastName || "").slice(0, 100),
        email: String(body.email || "").slice(0, 200),
        phone: String(body.phone || "").slice(0, 50),
        source: "website",
        status: "new",
        vehicle_interest: String(body.vehicleInterest || "").slice(0, 500),
        notes: String(body.notes || "").slice(0, 2000),
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
