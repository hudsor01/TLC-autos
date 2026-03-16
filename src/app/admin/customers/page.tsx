"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deals?: { _id: string }[];
  _count?: { deals: number };
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data: CustomersResponse = await res.json();
      setCustomers(data.customers || data as unknown as Customer[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete customer");
    } finally {
      setDeleting(null);
    }
  };

  const getDealsCount = (customer: Customer): number => {
    if (customer._count?.deals !== undefined) return customer._count.deals;
    if (customer.deals) return customer.deals.length;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Customers</h1>
        </div>
        <Link href="/admin/customers/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
          </form>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No customers found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Link
                        href={`/admin/customers/${customer._id}`}
                        className="font-medium hover:underline"
                      >
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDealsCount(customer)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/customers/${customer._id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleting === customer._id}
                          onClick={() => handleDelete(customer._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
