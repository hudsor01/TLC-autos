"use client";

import { Car, UserPlus, Handshake, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalVehicles: number;
  activeLeads: number;
  totalDeals: number;
  totalRevenue: number;
}

const cards = [
  { key: "vehicles", icon: Car, label: "Total Inventory", field: "totalVehicles" as const },
  { key: "leads", icon: UserPlus, label: "Active Leads", field: "activeLeads" as const },
  { key: "deals", icon: Handshake, label: "Recent Deals", field: "totalDeals" as const },
  { key: "revenue", icon: DollarSign, label: "Total Revenue", field: "totalRevenue" as const },
] as const;

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, icon: Icon, label, field }) => {
        const value = props[field];
        const display = field === "totalRevenue" ? `$${value.toLocaleString()}` : value;

        return (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{display}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
