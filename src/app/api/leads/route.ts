import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Public endpoint for creating leads from the contact form.
 * No authentication required — this is the website contact form handler.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Only allow creating leads with specific fields (no admin fields)
  const lead = await prisma.lead.create({
    data: {
      firstName: String(body.firstName || "").slice(0, 100),
      lastName: String(body.lastName || "").slice(0, 100),
      email: String(body.email || "").slice(0, 200),
      phone: String(body.phone || "").slice(0, 50),
      source: "website",
      status: "new",
      vehicleInterest: String(body.vehicleInterest || "").slice(0, 500),
      notes: String(body.notes || "").slice(0, 2000),
    },
  });

  return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
}
