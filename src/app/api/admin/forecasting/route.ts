import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { camelKeys } from "@/lib/utils";

interface Deal {
  sale_date: string;
  total_price: number;
  selling_price: number;
  purchase_price: number;
  total_cost: number;
}

interface Vehicle {
  status: string;
  purchase_price: number;
  selling_price: number;
  total_cost: number;
  date_added: string;
  date_sold: string | null;
}

interface Lead {
  status: string;
  created_at: string;
}

/**
 * Simple linear regression returning slope and intercept.
 */
function linearRegression(points: Array<{ x: number; y: number }>) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export async function GET() {
  try {
    const { supabase, error: authError } = await requireAuth();
    if (authError) return authError;

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoff = twelveMonthsAgo.toISOString().split("T")[0];

    const [
      { data: deals },
      { data: vehicles },
      { data: leads },
      { data: allDeals },
    ] = await Promise.all([
      supabase
        .from("deals")
        .select("sale_date, total_price, selling_price")
        .eq("status", "completed")
        .gte("sale_date", cutoff)
        .order("sale_date", { ascending: true }),
      supabase
        .from("vehicles")
        .select("status, purchase_price, selling_price, total_cost, date_added, date_sold"),
      supabase
        .from("leads")
        .select("status, created_at")
        .gte("created_at", cutoff),
      supabase
        .from("deals")
        .select("sale_date, total_price, selling_price")
        .eq("status", "completed"),
    ]);

    const typedDeals = (deals ?? []) as Deal[];
    const typedVehicles = (vehicles ?? []) as Vehicle[];
    const typedLeads = (leads ?? []) as Lead[];
    const typedAllDeals = (allDeals ?? []) as Deal[];

    // ── Monthly revenue & deal count (last 12 months) ──
    const monthlyData: Record<string, { revenue: number; deals: number; month: string }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      monthlyData[key] = { revenue: 0, deals: 0, month: label };
    }

    for (const deal of typedDeals) {
      if (!deal.sale_date) continue;
      const key = deal.sale_date.slice(0, 7);
      if (monthlyData[key]) {
        monthlyData[key].revenue += deal.total_price || 0;
        monthlyData[key].deals += 1;
      }
    }

    const monthlyArray = Object.values(monthlyData);

    // ── Revenue forecast (next 6 months via linear regression) ──
    const revenuePoints = monthlyArray.map((m, i) => ({ x: i, y: m.revenue }));
    const revReg = linearRegression(revenuePoints);
    const dealPoints = monthlyArray.map((m, i) => ({ x: i, y: m.deals }));
    const dealReg = linearRegression(dealPoints);

    const forecast: Array<{ month: string; revenue: number; deals: number }> = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      forecast.push({
        month: label,
        revenue: Math.max(0, Math.round(revReg.intercept + revReg.slope * (monthlyArray.length - 1 + i))),
        deals: Math.max(0, Math.round(dealReg.intercept + dealReg.slope * (monthlyArray.length - 1 + i))),
      });
    }

    // ── Profit margins ──
    const soldVehicles = typedVehicles.filter((v) => v.status === "sold" && v.selling_price && v.total_cost);
    const profitByMonth: Record<string, { profit: number; count: number; month: string }> = {};
    for (const v of soldVehicles) {
      const soldDate = v.date_sold || v.date_added;
      if (!soldDate) continue;
      const key = soldDate.slice(0, 7);
      const d = new Date(soldDate);
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!profitByMonth[key]) profitByMonth[key] = { profit: 0, count: 0, month: label };
      profitByMonth[key].profit += (v.selling_price || 0) - (v.total_cost || 0);
      profitByMonth[key].count += 1;
    }
    const profitArray = Object.values(profitByMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // ── Inventory turnover ──
    const totalInventory = typedVehicles.length;
    const soldCount = soldVehicles.length;
    const avgInventory = totalInventory > 0 ? totalInventory : 1;
    const turnoverRate = soldCount / avgInventory;

    // Days on lot for sold vehicles
    const daysOnLot: number[] = [];
    for (const v of soldVehicles) {
      if (v.date_added && v.date_sold) {
        const added = new Date(v.date_added).getTime();
        const sold = new Date(v.date_sold).getTime();
        const days = Math.round((sold - added) / (1000 * 60 * 60 * 24));
        if (days >= 0) daysOnLot.push(days);
      }
    }
    const avgDaysOnLot = daysOnLot.length > 0
      ? Math.round(daysOnLot.reduce((s, d) => s + d, 0) / daysOnLot.length)
      : 0;

    // ── Lead conversion ──
    const totalLeads = typedLeads.length;
    const convertedLeads = typedLeads.filter((l) =>
      ["won", "converted", "completed"].includes(l.status)
    ).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Lead pipeline by month
    const leadsByMonth: Record<string, { newLeads: number; month: string }> = {};
    for (const lead of typedLeads) {
      if (!lead.created_at) continue;
      const key = lead.created_at.slice(0, 7);
      const d = new Date(lead.created_at);
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!leadsByMonth[key]) leadsByMonth[key] = { newLeads: 0, month: label };
      leadsByMonth[key].newLeads += 1;
    }
    const leadsArray = Object.values(leadsByMonth);

    // ── Summary KPIs ──
    const totalRevenue = typedAllDeals.reduce((s, d) => s + (d.total_price || 0), 0);
    const totalProfit = soldVehicles.reduce((s, v) => s + ((v.selling_price || 0) - (v.total_cost || 0)), 0);
    const avgDealSize = typedAllDeals.length > 0 ? totalRevenue / typedAllDeals.length : 0;
    const avgMargin = soldVehicles.length > 0 ? totalProfit / soldVehicles.length : 0;

    // Projected annual revenue based on forecast
    const projectedMonthlyRevenue = forecast.length > 0
      ? forecast.reduce((s, f) => s + f.revenue, 0) / forecast.length
      : 0;
    const projectedAnnualRevenue = projectedMonthlyRevenue * 12;

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalProfit,
        avgDealSize: Math.round(avgDealSize),
        avgMargin: Math.round(avgMargin),
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        avgDaysOnLot,
        conversionRate: Math.round(conversionRate * 10) / 10,
        projectedAnnualRevenue: Math.round(projectedAnnualRevenue),
      },
      charts: {
        monthlyRevenue: monthlyArray,
        revenueForecast: forecast,
        profitMargins: profitArray,
        leadPipeline: leadsArray,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch forecasting data" }, { status: 500 });
  }
}
