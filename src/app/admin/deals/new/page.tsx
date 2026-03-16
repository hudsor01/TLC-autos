"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Vehicle {
  _id: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  sellingPrice: number;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function NewDealPage() {
  const router = useRouter();

  // Vehicle & customer data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Deal form state
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [saleType, setSaleType] = useState("cash");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [tradeAllowance, setTradeAllowance] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [taxRate, setTaxRate] = useState(6.25);
  const [titleFee, setTitleFee] = useState(0);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [docFee, setDocFee] = useState(0);
  const [otherFees, setOtherFees] = useState(0);
  const [apr, setApr] = useState(0);
  const [term, setTerm] = useState(60);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/admin/vehicles?status=available");
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || data);
        }
      } catch {
        console.error("Failed to fetch vehicles");
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || data);
        }
      } catch {
        console.error("Failed to fetch customers");
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // When vehicle is selected, pre-fill selling price
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v._id === selectedVehicleId);
      if (vehicle) {
        setSellingPrice(vehicle.sellingPrice);
      }
    }
  }, [selectedVehicleId, vehicles]);

  // Filtered lists
  const filteredVehicles = vehicles.filter((v) => {
    if (!vehicleSearch) return true;
    const searchLower = vehicleSearch.toLowerCase();
    return (
      v.stockNumber.toLowerCase().includes(searchLower) ||
      v.make.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      String(v.year).includes(searchLower)
    );
  });

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const searchLower = customerSearch.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(customerSearch)
    );
  });

  // Live calculator
  const calculations = useMemo(() => {
    const netTrade = tradeAllowance - tradePayoff;
    const taxableAmount = sellingPrice - tradeAllowance;
    const taxAmount = Math.max(0, taxableAmount * (taxRate / 100));
    const totalFees = titleFee + registrationFee + docFee + otherFees;
    const totalPrice = sellingPrice - netTrade + taxAmount + totalFees;
    const amountFinanced = totalPrice - downPayment;

    let monthlyPayment = 0;
    if (
      (saleType === "finance" || saleType === "bhph") &&
      term > 0 &&
      amountFinanced > 0
    ) {
      if (apr > 0) {
        const monthlyRate = apr / 100 / 12;
        monthlyPayment =
          (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, term)) /
          (Math.pow(1 + monthlyRate, term) - 1);
      } else {
        monthlyPayment = amountFinanced / term;
      }
    }

    return {
      netTrade,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalFees,
      totalPrice: Math.round(totalPrice * 100) / 100,
      amountFinanced: Math.round(amountFinanced * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    };
  }, [
    sellingPrice,
    tradeAllowance,
    tradePayoff,
    downPayment,
    taxRate,
    titleFee,
    registrationFee,
    docFee,
    otherFees,
    apr,
    term,
    saleType,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedCustomerId) {
      setError("Please select both a vehicle and a customer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          customerId: selectedCustomerId,
          saleType,
          sellingPrice,
          tradeAllowance,
          tradePayoff,
          downPayment,
          taxRate,
          titleFee,
          registrationFee,
          docFee,
          otherFees,
          apr: saleType === "finance" || saleType === "bhph" ? apr : 0,
          term: saleType === "finance" || saleType === "bhph" ? term : 0,
          taxAmount: calculations.taxAmount,
          totalPrice: calculations.totalPrice,
          amountFinanced: calculations.amountFinanced,
          monthlyPayment: calculations.monthlyPayment,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create deal");
      }
      router.push("/admin/deals");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Deal</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search vehicles by stock#, make, model..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
            {loadingVehicles ? (
              <p className="text-muted-foreground">Loading vehicles...</p>
            ) : (
              <Select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
              >
                <option value="">-- Select a vehicle --</option>
                {filteredVehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    #{v.stockNumber} - {v.year} {v.make} {v.model} ($
                    {v.sellingPrice.toLocaleString()})
                  </option>
                ))}
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Customer Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Customer</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/customers/new")}
              >
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search customers by name, email, phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            {loadingCustomers ? (
              <p className="text-muted-foreground">Loading customers...</p>
            ) : (
              <Select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                <option value="">-- Select a customer --</option>
                {filteredCustomers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName} - {c.email || c.phone}
                  </option>
                ))}
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Sale Type */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {["cash", "finance", "bhph", "wholesale"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="saleType"
                    value={type}
                    checked={saleType === type}
                    onChange={(e) => setSaleType(e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="capitalize font-medium">
                    {type === "bhph" ? "BHPH" : type}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trade Allowance</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tradeAllowance}
                  onChange={(e) => setTradeAllowance(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trade Payoff</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tradePayoff}
                  onChange={(e) => setTradePayoff(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Down Payment</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Fees &amp; Taxes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Title Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={titleFee}
                  onChange={(e) => setTitleFee(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Doc Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={docFee}
                  onChange={(e) => setDocFee(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Other Fees</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={otherFees}
                  onChange={(e) => setOtherFees(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financing (only for finance/bhph) */}
        {(saleType === "finance" || saleType === "bhph") && (
          <Card>
            <CardHeader>
              <CardTitle>Financing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>APR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term (months)</Label>
                  <Select
                    value={String(term)}
                    onChange={(e) => setTerm(Number(e.target.value))}
                  >
                    {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                      <option key={m} value={m}>
                        {m} months
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Calculator Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Selling Price</p>
                <p className="text-lg font-semibold">
                  ${sellingPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Trade</p>
                <p className="text-lg font-semibold">
                  ${calculations.netTrade.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Amount</p>
                <p className="text-lg font-semibold">
                  ${calculations.taxAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-lg font-semibold">
                  ${calculations.totalFees.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-xl font-bold text-primary">
                  ${calculations.totalPrice.toLocaleString()}
                </p>
              </div>
              {(saleType === "finance" || saleType === "bhph") && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Amount Financed
                    </p>
                    <p className="text-lg font-semibold">
                      ${calculations.amountFinanced.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Monthly Payment
                    </p>
                    <p className="text-xl font-bold text-primary">
                      ${calculations.monthlyPayment.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting} size="lg">
            {submitting ? "Creating Deal..." : "Create Deal"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
