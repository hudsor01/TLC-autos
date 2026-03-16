"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2, Upload, Star, Loader2 } from "lucide-react";
import VehicleForm, { VehicleFormData } from "@/components/admin/vehicle-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

/* ---------- Types ---------- */

interface VehicleDetail {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  vehicleType: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  mileageType: string;
  fuelType: string;
  transmission: string;
  engine: string;
  cylinders: number;
  drivetrain: string;
  description: string;
  purchasePrice: number;
  buyerFee: number;
  lotFee: number;
  sellingPrice: number;
  status: string;
  locationCode: string;
  features: string[];
}

interface VehicleCost {
  id: string;
  description: string;
  amount: number;
  vendor: string;
  category: string;
  date: string;
}

interface VehicleImage {
  id: string;
  url: string;
  isPrimary: boolean;
  filename: string;
}

const COST_CATEGORIES = [
  "Repair",
  "Parts",
  "Detailing",
  "Transport",
  "Inspection",
  "Registration",
  "Other",
];

/* ---------- Page Component ---------- */

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [costs, setCosts] = useState<VehicleCost[]>([]);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- Fetch vehicle data ---- */

  const fetchVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`);
      if (!res.ok) throw new Error("Failed to load vehicle");
      const json = await res.json();
      setVehicle(json.vehicle ?? json);
      setCosts(json.costs ?? []);
      setImages(json.images ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  /* ---- Form submit (General Info tab) ---- */

  const handleFormSubmit = async (data: VehicleFormData) => {
    const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        features: data.features
          ? data.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        year: data.year ? parseInt(data.year, 10) : undefined,
        mileage: data.mileage ? parseInt(data.mileage, 10) : undefined,
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
        buyerFee: data.buyerFee ? parseFloat(data.buyerFee) : undefined,
        lotFee: data.lotFee ? parseFloat(data.lotFee) : undefined,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : undefined,
        cylinders: data.cylinders ? parseInt(data.cylinders, 10) : undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || "Failed to update vehicle");
    }

    await fetchVehicle();
  };

  /* ---- Convert VehicleDetail to VehicleFormData ---- */

  const toFormData = (v: VehicleDetail): Partial<VehicleFormData> => ({
    stockNumber: v.stockNumber ?? "",
    vin: v.vin ?? "",
    year: v.year?.toString() ?? "",
    make: v.make ?? "",
    model: v.model ?? "",
    trim: v.trim ?? "",
    bodyStyle: v.bodyStyle ?? "",
    vehicleType: v.vehicleType ?? "",
    exteriorColor: v.exteriorColor ?? "",
    interiorColor: v.interiorColor ?? "",
    mileage: v.mileage?.toString() ?? "",
    mileageType: v.mileageType ?? "Actual",
    fuelType: v.fuelType ?? "Gasoline",
    transmission: v.transmission ?? "Automatic",
    engine: v.engine ?? "",
    cylinders: v.cylinders?.toString() ?? "",
    drivetrain: v.drivetrain ?? "FWD",
    description: v.description ?? "",
    purchasePrice: v.purchasePrice?.toString() ?? "",
    buyerFee: v.buyerFee?.toString() ?? "",
    lotFee: v.lotFee?.toString() ?? "",
    sellingPrice: v.sellingPrice?.toString() ?? "",
    status: v.status ?? "available",
    locationCode: v.locationCode ?? "",
    features: Array.isArray(v.features) ? v.features.join(", ") : "",
  });

  /* ---- Loading / Error states ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading vehicle...
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-destructive">{error || "Vehicle not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/vehicles")}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-sm text-muted-foreground">
            Stock #{vehicle.stockNumber} &middot; VIN {vehicle.vin || "N/A"}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/vehicles")}>
          Back to Inventory
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        {/* -------- General Info Tab -------- */}
        <TabsContent value="general" className="mt-6">
          <VehicleForm
            initialData={toFormData(vehicle)}
            onSubmit={handleFormSubmit}
          />
        </TabsContent>

        {/* -------- Costs Tab -------- */}
        <TabsContent value="costs" className="mt-6">
          <CostsTab vehicleId={vehicleId} costs={costs} onRefresh={fetchVehicle} />
        </TabsContent>

        {/* -------- Images Tab -------- */}
        <TabsContent value="images" className="mt-6">
          <ImagesTab vehicleId={vehicleId} images={images} onRefresh={fetchVehicle} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ======================================================== */
/*  Costs Tab                                                */
/* ======================================================== */

function CostsTab({
  vehicleId,
  costs,
  onRefresh,
}: {
  vehicleId: string;
  costs: VehicleCost[];
  onRefresh: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [costForm, setCostForm] = useState({
    description: "",
    amount: "",
    vendor: "",
    category: "Repair",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleCostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCostForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...costForm,
          amount: parseFloat(costForm.amount) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to add cost");
      setCostForm({
        description: "",
        amount: "",
        vendor: "",
        category: "Repair",
        date: new Date().toISOString().slice(0, 10),
      });
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add cost");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCost = async (costId: string) => {
    setDeletingId(costId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/vehicles/${vehicleId}/costs/${costId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete cost");
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete cost");
    } finally {
      setDeletingId(null);
    }
  };

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Existing Costs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No costs recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell>{cost.vendor || "—"}</TableCell>
                    <TableCell>{cost.date}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${cost.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === cost.id}
                        onClick={() => handleDeleteCost(cost.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {costs.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${totalCosts.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Cost Form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Add Cost</h3>
          <form onSubmit={handleAddCost} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost-description">Description</Label>
                <Input
                  id="cost-description"
                  name="description"
                  value={costForm.description}
                  onChange={handleCostChange}
                  required
                  placeholder="e.g., Oil change"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-amount">Amount</Label>
                <Input
                  id="cost-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={costForm.amount}
                  onChange={handleCostChange}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-vendor">Vendor</Label>
                <Input
                  id="cost-vendor"
                  name="vendor"
                  value={costForm.vendor}
                  onChange={handleCostChange}
                  placeholder="Vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-category">Category</Label>
                <Select
                  id="cost-category"
                  name="category"
                  value={costForm.category}
                  onChange={handleCostChange}
                >
                  {COST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-date">Date</Label>
                <Input
                  id="cost-date"
                  name="date"
                  type="date"
                  value={costForm.date}
                  onChange={handleCostChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={adding}>
                {adding ? "Adding..." : "Add Cost"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================================================== */
/*  Images Tab                                               */
/* ======================================================== */

function ImagesTab({
  vehicleId,
  images,
  onRefresh,
}: {
  vehicleId: string;
  images: VehicleImage[];
  onRefresh: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(`/api/admin/vehicles/${vehicleId}/images`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload images");
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/vehicles/${vehicleId}/images/${imageId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete image");
      await onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimaryId(imageId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/vehicles/${vehicleId}/images/${imageId}/primary`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to set primary image");
      await onRefresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to set primary image"
      );
    } finally {
      setSettingPrimaryId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button asChild disabled={uploading} variant="outline">
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        {uploading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Image Gallery */}
      {images.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">
          No images uploaded yet. Click &ldquo;Upload Images&rdquo; to add
          photos.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.filename}
                  className="h-full w-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Primary
                  </div>
                )}
              </div>
              <CardContent className="flex items-center justify-between p-2">
                <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                  {image.filename}
                </span>
                <div className="flex gap-1">
                  {!image.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={settingPrimaryId === image.id}
                      onClick={() => handleSetPrimary(image.id)}
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === image.id}
                    onClick={() => handleDelete(image.id)}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
