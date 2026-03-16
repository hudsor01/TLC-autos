import { NextResponse } from "next/server";
import { fetchInventory } from "@/lib/frazer";

export async function GET() {
  const vehicles = await fetchInventory();
  return NextResponse.json(vehicles);
}
