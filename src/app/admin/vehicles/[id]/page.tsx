"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import VehicleForm from "@/components/admin/vehicle-form"
import type { VehicleFormValues } from "@/lib/schemas"
import type { VehicleImage } from "@/components/admin/image-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

/* ---------- Types ---------- */

interface VehicleDetail {
  id: string
  stockNumber: string
  vin: string
  year: number
  make: string
  model: string
  trim: string
  bodyStyle: string
  vehicleType: string
  exteriorColor: string
  interiorColor: string
  mileage: number
  mileageType: string
  fuelType: string
  transmission: string
  engine: string
  cylinders: number
  drivetrain: string
  description: string
  purchasePrice: number
  buyerFee: number
  lotFee: number
  sellingPrice: number
  status: string
  locationCode: string
  features: string[]
  vehicleImages: VehicleImage[]
}

interface VehicleCost {
  id: string
  description: string
  amount: number
  vendor: string
  category: string
  date: string
}

const COST_CATEGORIES = [
  "Repair",
  "Parts",
  "Detailing",
  "Transport",
  "Inspection",
  "Registration",
  "Other",
]

/* ---------- Page Component ---------- */

export default function VehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [costs, setCosts] = useState<VehicleCost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`)
      if (!res.ok) throw new Error("Failed to load vehicle")
      const json = await res.json()
      setVehicle(json.vehicle ?? json)
      setCosts(json.vehicleCosts ?? json.costs ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    fetchVehicle()
  }, [fetchVehicle])

  /* ---- Convert VehicleDetail to VehicleFormValues + extras ---- */

  const toFormData = (v: VehicleDetail): VehicleFormValues & { id: string; images: VehicleImage[] } => ({
    id: v.id,
    stockNumber: v.stockNumber ?? "",
    vin: v.vin ?? "",
    year: v.year ?? new Date().getFullYear(),
    make: v.make ?? "",
    model: v.model ?? "",
    trim: v.trim ?? "",
    bodyStyle: v.bodyStyle ?? "",
    vehicleType: v.vehicleType ?? "",
    exteriorColor: v.exteriorColor ?? "",
    interiorColor: v.interiorColor ?? "",
    mileage: v.mileage ?? 0,
    mileageType: v.mileageType ?? "Actual",
    fuelType: v.fuelType ?? "",
    transmission: v.transmission ?? "",
    engine: v.engine ?? "",
    cylinders: v.cylinders ?? 0,
    drivetrain: v.drivetrain ?? "",
    description: v.description ?? "",
    purchasePrice: v.purchasePrice ?? 0,
    buyerFee: v.buyerFee ?? 0,
    lotFee: v.lotFee ?? 0,
    sellingPrice: v.sellingPrice ?? 0,
    status: v.status ?? "available",
    locationCode: v.locationCode ?? "",
    features: Array.isArray(v.features) ? v.features.join(", ") : "",
    images: (v.vehicleImages ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? "",
      isPrimary: img.isPrimary ?? false,
      sortOrder: img.sortOrder ?? 0,
    })),
  })

  /* ---- Loading / Error states ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading vehicle...
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-destructive">{error || "Vehicle not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/vehicles")}>
          Back to Inventory
        </Button>
      </div>
    )
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
        </TabsList>

        {/* General Info Tab */}
        <TabsContent value="general" className="mt-6">
          <VehicleForm initialData={toFormData(vehicle)} />
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="mt-6">
          <CostsTab vehicleId={vehicleId} costs={costs} onRefresh={fetchVehicle} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ======================================================== */
/*  Costs Tab                                                */
/* ======================================================== */

function CostsTab({
  vehicleId,
  costs,
  onRefresh,
}: {
  vehicleId: string
  costs: VehicleCost[]
  onRefresh: () => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [costForm, setCostForm] = useState({
    description: "",
    amount: "",
    vendor: "",
    category: "Repair",
    date: new Date().toISOString().slice(0, 10),
  })

  const handleCostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setCostForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...costForm,
          amount: parseFloat(costForm.amount) || 0,
        }),
      })
      if (!res.ok) throw new Error("Failed to add cost")
      setCostForm({
        description: "",
        amount: "",
        vendor: "",
        category: "Repair",
        date: new Date().toISOString().slice(0, 10),
      })
      await onRefresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add cost")
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteCost = async (costId: string) => {
    setDeletingId(costId)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/vehicles/${vehicleId}/costs/${costId}`,
        { method: "DELETE" },
      )
      if (!res.ok) throw new Error("Failed to delete cost")
      await onRefresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete cost")
    } finally {
      setDeletingId(null)
    }
  }

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

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
                    <TableCell>{cost.vendor || "\u2014"}</TableCell>
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
  )
}
