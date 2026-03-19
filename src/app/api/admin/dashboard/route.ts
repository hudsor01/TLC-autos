import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { camelKeys } from "@/lib/utils";

export async function GET() {
  try {
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

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
      { data: revenueData },
      { data: salesTrendRaw },
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
      supabase.from("deals").select("total_price").eq("status", "completed"),
      supabase
        .from("deals")
        .select("sale_date, total_price")
        .eq("status", "completed")
        .gte("sale_date", sixMonthsAgo.toISOString().split("T")[0])
        .order("sale_date", { ascending: true }),
    ]);

    const totalRevenue = (revenueData ?? []).reduce((sum, d) => sum + (d.total_price || 0), 0);

    const salesByMonth: Record<string, { deals: number; revenue: number }> = {};
    for (const deal of salesTrendRaw ?? []) {
      if (!deal.sale_date) continue;
      const month = new Date(deal.sale_date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!salesByMonth[month]) salesByMonth[month] = { deals: 0, revenue: 0 };
      salesByMonth[month].deals += 1;
      salesByMonth[month].revenue += deal.total_price || 0;
    }
    const salesTrend = Object.entries(salesByMonth).map(([month, data]) => ({
      month,
      deals: data.deals,
      revenue: data.revenue,
    }));

    const inventoryByStatus = [
      { status: "Available", count: availableVehicles ?? 0 },
      { status: "Pending", count: pendingVehicles ?? 0 },
      { status: "Sold", count: soldVehicles ?? 0 },
    ];

    return NextResponse.json({
      stats: {
        totalVehicles: totalVehicles ?? 0,
        availableVehicles: availableVehicles ?? 0,
        pendingVehicles: pendingVehicles ?? 0,
        soldVehicles: soldVehicles ?? 0,
        totalCustomers: totalCustomers ?? 0,
        activeLeads: activeLeads ?? 0,
        totalDeals: totalDeals ?? 0,
        totalRevenue,
      },
      recentVehicles: camelKeys(recentVehicles ?? []),
      recentLeads: camelKeys(recentLeads ?? []),
      charts: {
        salesTrend,
        inventoryByStatus,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
