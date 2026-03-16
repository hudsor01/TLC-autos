"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Deal {
  _id: string;
  dealNumber?: string;
  vehicle?: {
    year?: number;
    make?: string;
    model?: string;
  };
  saleType?: string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
}

interface Lead {
  _id: string;
  source?: string;
  status?: string;
  vehicleInterest?: string;
  createdAt?: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  driversLicense: string;
  notes: string;
  deals?: Deal[];
  leads?: Lead[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/admin/customers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch customer");
        const data = await res.json();
        setCustomer(data);
        setForm(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      const data = await res.json();
      setCustomer(data);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const dealStatusVariant = (
    status?: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "voided":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading customer...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {customer.firstName} {customer.lastName}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/customers")}
        >
          Back to Customers
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Customer Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Information</CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setForm(customer);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={form.firstName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={form.lastName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  name="city"
                  value={form.city || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Zip</Label>
                <Input
                  name="zip"
                  value={form.zip || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Driver&apos;s License</Label>
                <Input
                  name="driversLicense"
                  value={form.driversLicense || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  name="notes"
                  value={form.notes || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{customer.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{customer.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>
                  {customer.address
                    ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Driver&apos;s License
                </p>
                <p>{customer.driversLicense || "N/A"}</p>
              </div>
              {customer.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{customer.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal History */}
      <Card>
        <CardHeader>
          <CardTitle>Deal History</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.deals && customer.deals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal #</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Sale Type</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.deals.map((deal) => (
                  <TableRow key={deal._id}>
                    <TableCell className="font-medium">
                      {deal.dealNumber || deal._id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      {deal.vehicle
                        ? `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`
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
                      <Badge variant={dealStatusVariant(deal.status)}>
                        {deal.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deal.createdAt
                        ? new Date(deal.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/deals/${deal._id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No deals yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Lead History */}
      <Card>
        <CardHeader>
          <CardTitle>Lead History</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.leads && customer.leads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Vehicle Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.source || "N/A"}</TableCell>
                    <TableCell>{lead.vehicleInterest || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lead.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No leads yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
