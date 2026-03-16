import { NextResponse } from "next/server";
import { fetchInventory } from "@/lib/inventory";

export async function GET() {
  const vehicles = await fetchInventory();
  return NextResponse.json(vehicles);
}
