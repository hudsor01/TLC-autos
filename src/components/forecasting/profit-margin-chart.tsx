"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitMarginChartProps {
  data: Array<{ month: string; profit: number; count: number }>;
}

export function ProfitMarginChart({ data }: ProfitMarginChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    avgProfit: d.count > 0 ? Math.round(d.profit / d.count) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profit per Vehicle (Sold)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No profit data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
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
                  name === "avgProfit" ? "Avg Profit/Vehicle" : "Total Profit",
                ]}
              />
              <Bar dataKey="profit" fill="var(--success)" radius={[4, 4, 0, 0]} name="profit" />
              <Bar dataKey="avgProfit" fill="var(--primary)" radius={[4, 4, 0, 0]} name="avgProfit" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
