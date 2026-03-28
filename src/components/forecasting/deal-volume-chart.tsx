"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealVolumeChartProps {
  historical: Array<{ month: string; revenue: number; deals: number }>;
  forecast: Array<{ month: string; revenue: number; deals: number }>;
}

export function DealVolumeChart({ historical, forecast }: DealVolumeChartProps) {
  const combined = [
    ...historical.map((d) => ({ month: d.month, deals: d.deals, type: "actual" as const })),
    ...forecast.map((d) => ({ month: d.month, deals: d.deals, type: "forecast" as const })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deal Volume (Actual + Projected)</CardTitle>
      </CardHeader>
      <CardContent>
        {combined.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No deal data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combined}>
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, _: string, entry: { payload: { type: string } }) => [
                  value,
                  entry.payload.type === "forecast" ? "Projected Deals" : "Actual Deals",
                ]}
              />
              <Bar dataKey="deals" radius={[4, 4, 0, 0]}>
                {combined.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.type === "forecast" ? "var(--warning)" : "var(--primary)"}
                    opacity={entry.type === "forecast" ? 0.7 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
