"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Users, UserPlus, Handshake, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardData {
  stats: {
    totalVehicles: number;
    availableVehicles: number;
    pendingVehicles: number;
    soldVehicles: number;
    totalCustomers: number;
    activeLeads: number;
    totalDeals: number;
  };
  recentVehicles: Array<{
    id: string;
    stockNumber: string;
    year: number;
    make: string;
    model: string;
    sellingPrice: number;
    status: string;
    dateAdded: string;
  }>;
  recentLeads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    source: string;
    status: string;
    vehicleInterest: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading dashboard...</div>;
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/admin/vehicles/new">
            <Plus className="mr-1 h-4 w-4" /> Add Vehicle
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/deals/new">
            <Plus className="mr-1 h-4 w-4" /> New Deal
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/customers/new">
            <Plus className="mr-1 h-4 w-4" /> New Customer
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Car} label="Total Inventory" value={stats.totalVehicles} detail={`${stats.availableVehicles} available`} />
        <StatCard icon={Car} label="Pending Sales" value={stats.pendingVehicles} detail={`${stats.soldVehicles} sold total`} />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} />
        <StatCard icon={UserPlus} label="Active Leads" value={stats.activeLeads} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Inventory</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/vehicles">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentVehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Link href={`/admin/vehicles/${v.id}`} className="font-medium hover:underline">
                        {v.year} {v.make} {v.model}
                      </Link>
                      <div className="text-xs text-muted-foreground">{v.stockNumber}</div>
                    </TableCell>
                    <TableCell>${v.sellingPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/leads">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Link href={`/admin/leads/${l.id}`} className="font-medium hover:underline">
                        {l.firstName} {l.lastName}
                      </Link>
                      <div className="text-xs text-muted-foreground">{l.source}</div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {l.vehicleInterest || "—"}
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={l.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "available" ? "default" : status === "pending" ? "secondary" : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function LeadStatusBadge({ status }: { status: string }) {
  const variant =
    status === "new" ? "secondary" :
    status === "contacted" ? "default" :
    status === "qualified" ? "default" :
    "outline";
  return <Badge variant={variant}>{status}</Badge>;
}
