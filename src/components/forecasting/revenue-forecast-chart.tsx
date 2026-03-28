"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueForecastChartProps {
  historical: Array<{ month: string; revenue: number; deals: number }>;
  forecast: Array<{ month: string; revenue: number; deals: number }>;
}

export function RevenueForecastChart({ historical, forecast }: RevenueForecastChartProps) {
  const combined = [
    ...historical.map((d) => ({ ...d, forecastRevenue: undefined as number | undefined })),
    // Bridge: last historical point starts the forecast line
    ...(historical.length > 0
      ? [
          {
            month: historical[historical.length - 1].month,
            revenue: undefined as number | undefined,
            deals: undefined as number | undefined,
            forecastRevenue: historical[historical.length - 1].revenue,
          },
        ]
      : []),
    ...forecast.map((d) => ({
      month: d.month,
      revenue: undefined as number | undefined,
      deals: undefined as number | undefined,
      forecastRevenue: d.revenue,
    })),
  ];

  const dividerMonth = historical.length > 0 ? historical[historical.length - 1].month : undefined;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">Revenue Forecast (6-Month Projection)</CardTitle>
      </CardHeader>
      <CardContent>
        {combined.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No data available yet. Complete some deals to generate forecasts.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={combined}>
              <defs>
                <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                className="fill-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="fill-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, name: string) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "forecastRevenue" ? "Projected Revenue" : "Actual Revenue",
                ]}
              />
              {dividerMonth && (
                <ReferenceLine
                  x={dividerMonth}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  label={{ value: "Now", position: "top", fill: "var(--muted-foreground)", fontSize: 11 }}
                />
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#historicalGrad)"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecastRevenue"
                stroke="var(--warning)"
                strokeWidth={2}
                strokeDasharray="6 3"
                fill="url(#forecastGrad)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
