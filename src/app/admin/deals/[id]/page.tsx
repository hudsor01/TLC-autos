"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Deal {
  _id: string;
  dealNumber?: string;
  vehicle?: {
    _id?: string;
    stockNumber?: string;
    year?: number;
    make?: string;
    model?: string;
    vin?: string;
  };
  customer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  saleType: string;
  sellingPrice: number;
  tradeAllowance: number;
  tradePayoff: number;
  downPayment: number;
  taxRate: number;
  taxAmount: number;
  titleFee: number;
  registrationFee: number;
  docFee: number;
  otherFees: number;
  totalPrice: number;
  amountFinanced: number;
  monthlyPayment: number;
  apr: number;
  term: number;
  status: string;
  createdAt?: string;
}

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

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/admin/deals/${id}`);
        if (!res.ok) throw new Error("Failed to fetch deal");
        const data = await res.json();
        setDeal(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    const confirmMsg =
      newStatus === "completed"
        ? "Mark this deal as complete? This will set the vehicle status to sold."
        : "Void this deal? This will set the vehicle back to available.";

    if (!confirm(confirmMsg)) return;

    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update deal");
      const data = await res.json();
      setDeal(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update deal");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading deal...
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Deal not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Deal #{deal.dealNumber || deal._id.slice(-6)}
          </h1>
          <Badge variant={statusBadgeVariant(deal.status)} className="mt-1">
            {deal.status}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/deals")}
        >
          Back to Deals
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Deal Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {deal.vehicle
                  ? `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`
                  : "N/A"}
              </p>
              {deal.vehicle?.stockNumber && (
                <p className="text-sm text-muted-foreground">
                  Stock #{deal.vehicle.stockNumber}
                </p>
              )}
              {deal.vehicle?.vin && (
                <p className="text-sm text-muted-foreground">
                  VIN: {deal.vehicle.vin}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">
                {deal.customer
                  ? `${deal.customer.firstName} ${deal.customer.lastName}`
                  : "N/A"}
              </p>
              {deal.customer?.email && (
                <p className="text-sm text-muted-foreground">
                  {deal.customer.email}
                </p>
              )}
              {deal.customer?.phone && (
                <p className="text-sm text-muted-foreground">
                  {deal.customer.phone}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sale Type</p>
              <p className="capitalize font-medium">{deal.saleType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {deal.createdAt
                  ? new Date(deal.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling Price</span>
              <span className="font-medium">
                ${deal.sellingPrice?.toLocaleString() || "0"}
              </span>
            </div>
            {deal.tradeAllowance > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trade Allowance</span>
                <span className="font-medium text-green-600">
                  -${deal.tradeAllowance.toLocaleString()}
                </span>
              </div>
            )}
            {deal.tradePayoff > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trade Payoff</span>
                <span className="font-medium">
                  +${deal.tradePayoff.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax ({deal.taxRate}%)
              </span>
              <span className="font-medium">
                ${deal.taxAmount?.toLocaleString() || "0"}
              </span>
            </div>
            {deal.titleFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title Fee</span>
                <span className="font-medium">
                  ${deal.titleFee.toLocaleString()}
                </span>
              </div>
            )}
            {deal.registrationFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee</span>
                <span className="font-medium">
                  ${deal.registrationFee.toLocaleString()}
                </span>
              </div>
            )}
            {deal.docFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doc Fee</span>
                <span className="font-medium">
                  ${deal.docFee.toLocaleString()}
                </span>
              </div>
            )}
            {deal.otherFees > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other Fees</span>
                <span className="font-medium">
                  ${deal.otherFees.toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold">Total Price</span>
              <span className="font-bold text-lg">
                ${deal.totalPrice?.toLocaleString() || "0"}
              </span>
            </div>
            {deal.downPayment > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-medium text-green-600">
                  -${deal.downPayment.toLocaleString()}
                </span>
              </div>
            )}
            {(deal.saleType === "finance" || deal.saleType === "bhph") && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Amount Financed
                  </span>
                  <span className="font-medium">
                    ${deal.amountFinanced?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    APR / Term
                  </span>
                  <span className="font-medium">
                    {deal.apr}% / {deal.term} months
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Monthly Payment</span>
                  <span className="font-bold text-lg text-primary">
                    ${deal.monthlyPayment?.toLocaleString() || "0"}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {deal.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => handleStatusUpdate("completed")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Mark Complete"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("voided")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Void Deal"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Completing the deal will set the vehicle status to &quot;sold&quot;.
              Voiding will set it back to &quot;available&quot;.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
