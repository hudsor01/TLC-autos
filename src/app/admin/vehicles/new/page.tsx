"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VehicleForm, { VehicleFormData } from "@/components/admin/vehicle-form";

export default function AddVehiclePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: VehicleFormData) => {
    setError(null);
    const res = await fetch("/api/admin/vehicles", {
      method: "POST",
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
      throw new Error(body?.error || "Failed to create vehicle");
    }

    router.push("/admin/vehicles");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Vehicle</h1>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <VehicleForm onSubmit={handleSubmit} />
    </div>
  );
}
