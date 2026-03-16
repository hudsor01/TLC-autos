import { NextRequest, NextResponse } from "next/server";
import { decodeVin } from "@/lib/vin-decoder";

export async function POST(req: NextRequest) {
  const { vin } = await req.json();

  if (!vin || typeof vin !== "string") {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 });
  }

  const result = await decodeVin(vin);

  if (!result) {
    return NextResponse.json(
      { error: "Could not decode VIN. Check that it is a valid 17-character VIN." },
      { status: 422 }
    );
  }

  return NextResponse.json(result);
}
