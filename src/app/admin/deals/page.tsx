"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Deal {
  _id: string;
  dealNumber?: string;
  vehicle?: {
    year?: number;
    make?: string;
    model?: string;
  };
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  saleType?: string;
  totalPrice?: number;
  status: string;
  createdAt?: string;
}

const STATUS_TABS = ["all", "pending", "completed", "voided"] as const;

function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "voided":
      return "destructive";
    default:
      return "outline";
  }
}

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/admin/deals?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch deals");
        const data = await res.json();
        setDeals(data.deals || data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Deals</h1>
        </div>
        <Link href="/admin/deals/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Deal
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {STATUS_TABS.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading deals...
              </div>
            ) : deals.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No deals found.
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal #</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Sale Type</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((deal) => (
                        <TableRow key={deal._id}>
                          <TableCell className="font-mono text-sm">
                            {deal.dealNumber || deal._id.slice(-6)}
                          </TableCell>
                          <TableCell>
                            {deal.vehicle
                              ? `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {deal.customer
                              ? `${deal.customer.firstName} ${deal.customer.lastName}`
                              : "N/A"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {deal.saleType || "N/A"}
                          </TableCell>
                          <TableCell>
                            {deal.totalPrice
                              ? `$${deal.totalPrice.toLocaleString()}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(deal.status)}>
                              {deal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/deals/${deal._id}`)
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
