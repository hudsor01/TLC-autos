"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { RevenueForecastChart } from "@/components/forecasting/revenue-forecast-chart";
import { ProfitMarginChart } from "@/components/forecasting/profit-margin-chart";
import { DealVolumeChart } from "@/components/forecasting/deal-volume-chart";
import { LeadPipelineChart } from "@/components/forecasting/lead-pipeline-chart";

interface ForecastData {
  kpis: {
    totalRevenue: number;
    totalProfit: number;
    avgDealSize: number;
    avgMargin: number;
    turnoverRate: number;
    avgDaysOnLot: number;
    conversionRate: number;
    projectedAnnualRevenue: number;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number; deals: number }>;
    revenueForecast: Array<{ month: string; revenue: number; deals: number }>;
    profitMargins: Array<{ month: string; profit: number; count: number }>;
    leadPipeline: Array<{ month: string; newLeads: number }>;
  };
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && trend !== "neutral" && (
            <span className={trend === "up" ? "text-success" : "text-destructive"}>
              {trend === "up" ? (
                <ArrowUpRight className="inline h-4 w-4" />
              ) : (
                <ArrowDownRight className="inline h-4 w-4" />
              )}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function ForecastingPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/forecasting");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch forecasting data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Forecasting</h2>
        <p className="text-muted-foreground">
          Revenue projections, profit analysis, and performance metrics for TLC Autos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard
              title="Total Revenue"
              value={fmt(data.kpis.totalRevenue)}
              subtitle="All-time completed deals"
              icon={DollarSign}
              trend="neutral"
            />
            <KpiCard
              title="Total Profit"
              value={fmt(data.kpis.totalProfit)}
              subtitle={`Avg ${fmt(data.kpis.avgMargin)} per vehicle`}
              icon={TrendingUp}
              trend={data.kpis.totalProfit > 0 ? "up" : "down"}
            />
            <KpiCard
              title="Avg Deal Size"
              value={fmt(data.kpis.avgDealSize)}
              subtitle="Across all completed deals"
              icon={BarChart3}
              trend="neutral"
            />
            <KpiCard
              title="Projected Annual Revenue"
              value={fmt(data.kpis.projectedAnnualRevenue)}
              subtitle="Based on 6-month trend"
              icon={Target}
              trend={data.kpis.projectedAnnualRevenue > data.kpis.totalRevenue ? "up" : "neutral"}
            />
          </>
        ) : null}
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard
              title="Inventory Turnover"
              value={`${data.kpis.turnoverRate}x`}
              subtitle="Sold vs total inventory"
              icon={BarChart3}
              trend="neutral"
            />
            <KpiCard
              title="Avg Days on Lot"
              value={`${data.kpis.avgDaysOnLot} days`}
              subtitle="From added to sold"
              icon={Clock}
              trend={data.kpis.avgDaysOnLot < 60 ? "up" : "down"}
            />
            <KpiCard
              title="Lead Conversion"
              value={`${data.kpis.conversionRate}%`}
              subtitle="Leads converted to sales"
              icon={Target}
              trend={data.kpis.conversionRate > 10 ? "up" : "neutral"}
            />
          </>
        ) : null}
      </div>

      {/* Revenue Forecast Chart */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      ) : data ? (
        <RevenueForecastChart
          historical={data.charts.monthlyRevenue}
          forecast={data.charts.revenueForecast}
        />
      ) : null}

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </>
        ) : data ? (
          <>
            <DealVolumeChart
              historical={data.charts.monthlyRevenue}
              forecast={data.charts.revenueForecast}
            />
            <ProfitMarginChart data={data.charts.profitMargins} />
          </>
        ) : null}
      </div>

      {/* Lead Pipeline */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : data ? (
        <LeadPipelineChart data={data.charts.leadPipeline} />
      ) : null}
    </div>
  );
}
