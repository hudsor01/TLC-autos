import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const leadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().default(""),
  vehicleInterest: z.string().max(500).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
});

/**
 * Public endpoint for creating leads from the contact form.
 * No authentication required — RLS policy allows public inserts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, vehicleInterest, notes } = parsed.data;
    const supabase = await createClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        source: "website",
        status: "new",
        vehicle_interest: vehicleInterest,
        notes,
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
