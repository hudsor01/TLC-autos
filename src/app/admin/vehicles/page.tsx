"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Car } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Vehicle {
  id: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  sellingPrice: number;
  mileage: number;
  status: string;
}

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TABS = ["All", "Available", "Pending", "Sold"] as const;

export default function VehiclesPage() {
  const router = useRouter();

  const [data, setData] = useState<VehiclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "All") params.set("status", activeTab.toLowerCase());
      params.set("page", String(page));

      const res = await fetch(`/api/admin/vehicles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const json: VehiclesResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete vehicle");
      setDeleteTarget(null);
      fetchVehicles();
    } catch {
      setError("Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const statusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "default";
      case "pending":
        return "secondary";
      case "sold":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vehicle Inventory</h1>
        </div>
        <Button asChild>
          <Link href="/admin/vehicles/new">
            <Plus className="mr-1 h-4 w-4" /> Add Vehicle
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search stock#, make, model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </form>

            <div className="flex gap-1">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading vehicles...
        </div>
      )}

      {/* Table */}
      {!loading && data && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock #</TableHead>
                  <TableHead>Year / Make / Model</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono text-sm">
                        {vehicle.stockNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/vehicles/${vehicle.id}`}
                          className="font-medium hover:underline"
                        >
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Link>
                      </TableCell>
                      <TableCell>
                        ${vehicle.sellingPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {vehicle.mileage.toLocaleString()} mi
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/vehicles/${vehicle.id}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(vehicle)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages} ({data.total} total vehicles)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>
              {deleteTarget?.year} {deleteTarget?.make} {deleteTarget?.model}
            </strong>{" "}
            (Stock #{deleteTarget?.stockNumber})? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
