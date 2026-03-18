"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesChartProps {
  data: Array<{ month: string; deals: number; revenue: number }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No sales data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--card-foreground)",
                }}
                formatter={(value, name) => [
                  name === "revenue"
                    ? `$${Number(value).toLocaleString()}`
                    : value,
                  name === "revenue" ? "Revenue" : "Deals",
                ]}
              />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 3 }}
                name="deals"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--success)"
                strokeWidth={2}
                dot={{ fill: "var(--success)", r: 3 }}
                name="revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
