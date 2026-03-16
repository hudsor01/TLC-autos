"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface VehicleFormData {
  stockNumber: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  vehicleType: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: string;
  mileageType: string;
  fuelType: string;
  transmission: string;
  engine: string;
  cylinders: string;
  drivetrain: string;
  description: string;
  purchasePrice: string;
  buyerFee: string;
  lotFee: string;
  sellingPrice: string;
  status: string;
  locationCode: string;
  features: string;
}

const EMPTY_FORM: VehicleFormData = {
  stockNumber: "",
  vin: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  bodyStyle: "",
  vehicleType: "",
  exteriorColor: "",
  interiorColor: "",
  mileage: "",
  mileageType: "Actual",
  fuelType: "Gasoline",
  transmission: "Automatic",
  engine: "",
  cylinders: "",
  drivetrain: "FWD",
  description: "",
  purchasePrice: "",
  buyerFee: "",
  lotFee: "",
  sellingPrice: "",
  status: "available",
  locationCode: "",
  features: "",
};

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => Promise<void>;
}

export default function VehicleForm({ initialData, onSubmit }: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [decodingVin, setDecodingVin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const totalCost = useMemo(() => {
    const purchase = parseFloat(form.purchasePrice) || 0;
    const buyer = parseFloat(form.buyerFee) || 0;
    const lot = parseFloat(form.lotFee) || 0;
    return purchase + buyer + lot;
  }, [form.purchasePrice, form.buyerFee, form.lotFee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDecodeVin = async () => {
    if (!form.vin || form.vin.length < 11) {
      setError("Please enter a valid VIN (at least 11 characters)");
      return;
    }
    setDecodingVin(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vehicles/decode-vin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: form.vin }),
      });
      if (!res.ok) throw new Error("VIN decode failed");
      const decoded = await res.json();
      setForm((prev) => ({
        ...prev,
        year: decoded.year?.toString() || prev.year,
        make: decoded.make || prev.make,
        model: decoded.model || prev.model,
        trim: decoded.trim || prev.trim,
        bodyStyle: decoded.bodyStyle || prev.bodyStyle,
        vehicleType: decoded.vehicleType || prev.vehicleType,
        engine: decoded.engine || prev.engine,
        cylinders: decoded.cylinders?.toString() || prev.cylinders,
        transmission: decoded.transmission || prev.transmission,
        drivetrain: decoded.drivetrain || prev.drivetrain,
        fuelType: decoded.fuelType || prev.fuelType,
      }));
    } catch {
      setError("Failed to decode VIN. Please check and try again.");
    } finally {
      setDecodingVin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Vehicle Info */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">
          Vehicle Info
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="stockNumber">Stock Number</Label>
            <Input
              id="stockNumber"
              name="stockNumber"
              value={form.stockNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vin">VIN</Label>
            <div className="flex gap-2">
              <Input
                id="vin"
                name="vin"
                value={form.vin}
                onChange={handleChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDecodeVin}
                disabled={decodingVin}
              >
                {decodingVin ? "Decoding..." : "Decode VIN"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              name="make"
              value={form.make}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={form.model}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trim">Trim</Label>
            <Input
              id="trim"
              name="trim"
              value={form.trim}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyStyle">Body Style</Label>
            <Input
              id="bodyStyle"
              name="bodyStyle"
              value={form.bodyStyle}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Input
              id="vehicleType"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exteriorColor">Exterior Color</Label>
            <Input
              id="exteriorColor"
              name="exteriorColor"
              value={form.exteriorColor}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interiorColor">Interior Color</Label>
            <Input
              id="interiorColor"
              name="interiorColor"
              value={form.interiorColor}
              onChange={handleChange}
            />
          </div>
        </div>
      </fieldset>

      {/* Specifications */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">
          Specifications
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              value={form.mileage}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileageType">Mileage Type</Label>
            <Select
              id="mileageType"
              name="mileageType"
              value={form.mileageType}
              onChange={handleChange}
            >
              <option value="Actual">Actual</option>
              <option value="Excess">Excess</option>
              <option value="Discrepancy">Discrepancy</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Select
              id="fuelType"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
            >
              <option value="Gasoline">Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Plug-in Hybrid">Plug-in Hybrid</option>
              <option value="Flex Fuel">Flex Fuel</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select
              id="transmission"
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="CVT">CVT</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="engine">Engine</Label>
            <Input
              id="engine"
              name="engine"
              value={form.engine}
              onChange={handleChange}
              placeholder="e.g., 2.0L Turbo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cylinders">Cylinders</Label>
            <Input
              id="cylinders"
              name="cylinders"
              type="number"
              value={form.cylinders}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drivetrain">Drivetrain</Label>
            <Select
              id="drivetrain"
              name="drivetrain"
              value={form.drivetrain}
              onChange={handleChange}
            >
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
              <option value="4WD">4WD</option>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* Costs */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">
          Costs
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerFee">Buyer Fee</Label>
            <Input
              id="buyerFee"
              name="buyerFee"
              type="number"
              step="0.01"
              value={form.buyerFee}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lotFee">Lot Fee</Label>
            <Input
              id="lotFee"
              name="lotFee"
              type="number"
              step="0.01"
              value={form.lotFee}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Total Cost</Label>
            <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">
          Pricing
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              name="sellingPrice"
              type="number"
              step="0.01"
              value={form.sellingPrice}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationCode">Location Code</Label>
            <Input
              id="locationCode"
              name="locationCode"
              value={form.locationCode}
              onChange={handleChange}
            />
          </div>
        </div>
      </fieldset>

      {/* Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold border-b pb-2 w-full">
          Details
        </legend>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input
              id="features"
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder="e.g., Bluetooth, Backup Camera, Heated Seats"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Vehicle description..."
            />
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}
