import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { camelKeys } from "@/lib/utils";

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      { count: totalVehicles },
      { count: availableVehicles },
      { count: pendingVehicles },
      { count: soldVehicles },
      { count: totalCustomers },
      { count: activeLeads },
      { count: totalDeals },
      { data: recentVehicles },
      { data: recentLeads },
    ] = await Promise.all([
      supabase.from("vehicles").select("*", { count: "exact", head: true }),
      supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "available"),
      supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "sold"),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["new", "contacted", "qualified"]),
      supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase
        .from("vehicles")
        .select("id, stock_number, year, make, model, selling_price, status, date_added")
        .order("date_added", { ascending: false })
        .limit(5),
      supabase
        .from("leads")
        .select("id, first_name, last_name, source, status, vehicle_interest, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return NextResponse.json({
      stats: {
        totalVehicles: totalVehicles ?? 0,
        availableVehicles: availableVehicles ?? 0,
        pendingVehicles: pendingVehicles ?? 0,
        soldVehicles: soldVehicles ?? 0,
        totalCustomers: totalCustomers ?? 0,
        activeLeads: activeLeads ?? 0,
        totalDeals: totalDeals ?? 0,
      },
      recentVehicles: camelKeys(recentVehicles ?? []),
      recentLeads: camelKeys(recentLeads ?? []),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
