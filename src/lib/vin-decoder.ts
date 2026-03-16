/**
 * VIN Decoder using NHTSA vPIC API (free, public, no API key needed).
 * Replicates Frazer's VIN decode feature — auto-populates vehicle fields from VIN.
 */

export interface VinDecodeResult {
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  engine: string;
  cylinders: number | null;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  vehicleType: string;
}

interface NhtsaResult {
  Variable: string;
  Value: string | null;
}

export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  if (!vin || vin.length !== 17) return null;

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );

    if (!res.ok) return null;

    const data = await res.json();
    const results: NhtsaResult[] = data.Results || [];

    const get = (variable: string): string => {
      const item = results.find(
        (r) => r.Variable === variable && r.Value && r.Value.trim() !== ""
      );
      return item?.Value?.trim() || "";
    };

    const yearStr = get("Model Year");
    if (!yearStr) return null;

    return {
      year: parseInt(yearStr) || 0,
      make: get("Make"),
      model: get("Model"),
      trim: get("Trim"),
      bodyStyle: get("Body Class"),
      engine: formatEngine(get("Displacement (L)"), get("Engine Number of Cylinders")),
      cylinders: parseInt(get("Engine Number of Cylinders")) || null,
      fuelType: mapFuelType(get("Fuel Type - Primary")),
      transmission: get("Transmission Style"),
      drivetrain: mapDrivetrain(get("Drive Type")),
      vehicleType: get("Vehicle Type"),
    };
  } catch {
    return null;
  }
}

function formatEngine(displacementL: string, cylinders: string): string {
  const parts: string[] = [];
  if (displacementL) parts.push(`${displacementL}L`);
  if (cylinders) parts.push(`${cylinders}-Cylinder`);
  return parts.join(" ") || "";
}

function mapFuelType(nhtsaFuel: string): string {
  const lower = nhtsaFuel.toLowerCase();
  if (lower.includes("diesel")) return "Diesel";
  if (lower.includes("electric")) return "Electric";
  if (lower.includes("hybrid") || lower.includes("plug-in")) return "Hybrid";
  if (lower.includes("gasoline") || lower.includes("gas")) return "Gasoline";
  return nhtsaFuel || "Gasoline";
}

function mapDrivetrain(nhtsaDrive: string): string {
  const lower = nhtsaDrive.toLowerCase();
  if (lower.includes("4x4") || lower.includes("4wd") || lower.includes("four")) return "4WD";
  if (lower.includes("awd") || lower.includes("all")) return "AWD";
  if (lower.includes("fwd") || lower.includes("front")) return "FWD";
  if (lower.includes("rwd") || lower.includes("rear")) return "RWD";
  return nhtsaDrive || "";
}
