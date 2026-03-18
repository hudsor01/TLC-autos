/**
 * Seed script for TLC Autos dealership data.
 *
 * Populates the database with realistic test data:
 * ~20 vehicles (with images uploaded to Storage), ~15 customers,
 * ~25 leads, ~10 deals, and ~15 follow-ups.
 *
 * Usage: bun run scripts/seed.ts
 *    or: npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

// ---------------------------------------------------------------------------
// Environment checks
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) {
  console.error("[Seed] NEXT_PUBLIC_SUPABASE_URL is not set. Exiting.");
  process.exit(1);
}

if (!SUPABASE_SECRET_KEY) {
  console.error("[Seed] SUPABASE_SECRET_KEY is not set. Exiting.");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateVIN(): string {
  const prefix = randomPick([
    "1HGCM82633A",
    "2T1BU4EE9DC",
    "5YFBURHE1FP",
    "1FADP3F21JL",
    "3N1AB7AP5KY",
    "WBAPH5C55BA",
    "WDDGF4HB1EA",
    "5NPE24AF8FH",
    "KNDJP3A51H7",
    "2C3CDXCT5NH",
  ]);
  const suffix = String(randomInt(100000, 999999));
  return prefix + suffix;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Data definitions
// ---------------------------------------------------------------------------

interface VehicleSeed {
  make: string;
  model: string;
  trim: string;
  body_style: string;
  engine: string;
  cylinders: number;
  drivetrain: string;
}

const VEHICLE_TEMPLATES: VehicleSeed[] = [
  { make: "Toyota", model: "Camry", trim: "SE", body_style: "Sedan", engine: "2.5L I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Toyota", model: "RAV4", trim: "XLE", body_style: "SUV", engine: "2.5L I4", cylinders: 4, drivetrain: "AWD" },
  { make: "Honda", model: "Civic", trim: "EX", body_style: "Sedan", engine: "2.0L I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Honda", model: "Accord", trim: "Sport", body_style: "Sedan", engine: "1.5L Turbo I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Ford", model: "F-150", trim: "XLT", body_style: "Truck", engine: "3.5L EcoBoost V6", cylinders: 6, drivetrain: "4WD" },
  { make: "Ford", model: "Escape", trim: "SE", body_style: "SUV", engine: "1.5L EcoBoost I3", cylinders: 3, drivetrain: "FWD" },
  { make: "Chevrolet", model: "Silverado 1500", trim: "LT", body_style: "Truck", engine: "5.3L V8", cylinders: 8, drivetrain: "4WD" },
  { make: "Chevrolet", model: "Equinox", trim: "LT", body_style: "SUV", engine: "1.5L Turbo I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Nissan", model: "Altima", trim: "SV", body_style: "Sedan", engine: "2.5L I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Nissan", model: "Rogue", trim: "SL", body_style: "SUV", engine: "2.5L I4", cylinders: 4, drivetrain: "AWD" },
  { make: "BMW", model: "3 Series", trim: "330i", body_style: "Sedan", engine: "2.0L Turbo I4", cylinders: 4, drivetrain: "RWD" },
  { make: "BMW", model: "X3", trim: "xDrive30i", body_style: "SUV", engine: "2.0L Turbo I4", cylinders: 4, drivetrain: "AWD" },
  { make: "Mercedes-Benz", model: "C-Class", trim: "C300", body_style: "Sedan", engine: "2.0L Turbo I4", cylinders: 4, drivetrain: "RWD" },
  { make: "Mercedes-Benz", model: "GLC", trim: "GLC300", body_style: "SUV", engine: "2.0L Turbo I4", cylinders: 4, drivetrain: "AWD" },
  { make: "Hyundai", model: "Elantra", trim: "SEL", body_style: "Sedan", engine: "2.0L I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Hyundai", model: "Tucson", trim: "SEL", body_style: "SUV", engine: "2.5L I4", cylinders: 4, drivetrain: "AWD" },
  { make: "Kia", model: "Forte", trim: "LXS", body_style: "Sedan", engine: "2.0L I4", cylinders: 4, drivetrain: "FWD" },
  { make: "Kia", model: "Sportage", trim: "EX", body_style: "SUV", engine: "2.5L I4", cylinders: 4, drivetrain: "AWD" },
  { make: "Dodge", model: "Charger", trim: "SXT", body_style: "Sedan", engine: "3.6L V6", cylinders: 6, drivetrain: "RWD" },
  { make: "Dodge", model: "Durango", trim: "GT", body_style: "SUV", engine: "3.6L V6", cylinders: 6, drivetrain: "AWD" },
];

const EXTERIOR_COLORS = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Burgundy", "Pearl White", "Midnight Blue"];
const INTERIOR_COLORS = ["Black", "Gray", "Tan", "Beige", "Brown", "Ivory"];
const FUEL_TYPES = ["Gasoline", "Gasoline", "Gasoline", "Hybrid", "Diesel"];
const TRANSMISSIONS = ["Automatic", "Automatic", "Automatic", "CVT", "Manual"];

const FEATURES_POOL = [
  "Backup Camera", "Bluetooth", "Apple CarPlay", "Android Auto",
  "Keyless Entry", "Push Button Start", "Heated Seats", "Sunroof",
  "Leather Seats", "Navigation", "Blind Spot Monitor", "Lane Departure Warning",
  "Adaptive Cruise Control", "Power Windows", "Power Locks", "Alloy Wheels",
  "LED Headlights", "Remote Start", "Tow Package", "Roof Rails",
];

const CUSTOMER_FIRST_NAMES = [
  "James", "Maria", "Robert", "Jennifer", "Michael",
  "Linda", "David", "Patricia", "William", "Elizabeth",
  "Richard", "Barbara", "Joseph", "Susan", "Thomas",
];

const CUSTOMER_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones",
  "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
];

const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
const LEAD_SOURCES = ["website", "phone", "walk-in", "referral"] as const;

const DEAL_STATUSES = ["pending", "approved", "funded", "delivered"] as const;

const FOLLOW_UP_TYPES = ["note", "call", "email", "appointment"] as const;

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

async function cleanExistingData(): Promise<void> {
  console.log("[Seed] Cleaning existing data...");

  // Delete in FK order
  const tables = [
    "follow_ups",
    "deals",
    "leads",
    "vehicle_costs",
    "vehicle_images",
    "customers",
    "vehicles",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().gte("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`[Seed] Warning: could not clean ${table}: ${error.message}`);
    }
  }

  // Clean storage bucket
  try {
    const { data: files } = await supabase.storage.from("vehicle-images").list("vehicles", { limit: 1000 });
    if (files && files.length > 0) {
      // List each vehicle subfolder and delete contents
      for (const folder of files) {
        const { data: vehicleFiles } = await supabase.storage
          .from("vehicle-images")
          .list(`vehicles/${folder.name}`, { limit: 100 });
        if (vehicleFiles && vehicleFiles.length > 0) {
          const paths = vehicleFiles.map((f) => `vehicles/${folder.name}/${f.name}`);
          await supabase.storage.from("vehicle-images").remove(paths);
        }
      }
    }
  } catch (err) {
    console.warn("[Seed] Warning: could not clean storage bucket:", err);
  }

  console.log("[Seed] Cleaned existing data");
}

// ---------------------------------------------------------------------------
// Seed vehicles
// ---------------------------------------------------------------------------

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

async function seedVehicles(): Promise<VehicleRow[]> {
  console.log("[Seed] Seeding vehicles...");

  const statuses = [
    "available", "available", "available", "available", "available",
    "available", "available", "available", "available", "available",
    "available", "available", "available", "available",
    "sold", "sold", "sold", "sold",
    "pending", "pending",
  ];

  const vehicleInserts: Database["public"]["Tables"]["vehicles"]["Insert"][] = VEHICLE_TEMPLATES.map(
    (tpl, i) => {
      const year = randomInt(2015, 2023);
      const purchasePrice = randomInt(5000, 35000);
      const markup = 1 + randomInt(15, 25) / 100;
      const sellingPrice = Math.round(purchasePrice * markup);
      const featureCount = randomInt(4, 10);
      const features: string[] = [];
      const shuffled = [...FEATURES_POOL].sort(() => Math.random() - 0.5);
      for (let f = 0; f < featureCount; f++) features.push(shuffled[f]);

      return {
        stock_number: `TLC-${String(i + 1).padStart(3, "0")}`,
        vin: generateVIN(),
        year,
        make: tpl.make,
        model: tpl.model,
        trim: tpl.trim,
        body_style: tpl.body_style,
        exterior_color: randomPick(EXTERIOR_COLORS),
        interior_color: randomPick(INTERIOR_COLORS),
        mileage: randomInt(20000, 150000),
        fuel_type: randomPick(FUEL_TYPES),
        transmission: randomPick(TRANSMISSIONS),
        engine: tpl.engine,
        cylinders: tpl.cylinders,
        drivetrain: tpl.drivetrain,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        status: statuses[i],
        description: `${year} ${tpl.make} ${tpl.model} ${tpl.trim} in great condition. Well-maintained with full service history.`,
        features: features as unknown as Database["public"]["Tables"]["vehicles"]["Insert"]["features"],
        date_added: new Date(Date.now() - randomInt(7, 90) * 86400000).toISOString().split("T")[0],
      };
    }
  );

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .insert(vehicleInserts)
    .select();

  if (error) {
    console.error("[Seed] Error seeding vehicles:", error.message);
    return [];
  }

  console.log(`[Seed] Seeded ${vehicles.length} vehicles`);
  return vehicles;
}

// ---------------------------------------------------------------------------
// Upload vehicle images
// ---------------------------------------------------------------------------

async function uploadVehicleImages(vehicles: VehicleRow[]): Promise<number> {
  console.log("[Seed] Uploading vehicle images...");
  let totalImages = 0;

  for (const vehicle of vehicles) {
    const imageCount = randomInt(2, 3);
    try {
      for (let idx = 0; idx < imageCount; idx++) {
        try {
          const response = await fetch("https://picsum.photos/800/600");
          if (!response.ok) {
            console.warn(`[Seed] Warning: failed to fetch image for ${vehicle.stock_number} (${idx})`);
            continue;
          }
          const imageBuffer = await response.arrayBuffer();
          const storagePath = `vehicles/${vehicle.id}/${idx}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("vehicle-images")
            .upload(storagePath, imageBuffer, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.warn(`[Seed] Warning: upload failed for ${vehicle.stock_number} (${idx}): ${uploadError.message}`);
            continue;
          }

          const url = `${SUPABASE_URL}/storage/v1/object/public/vehicle-images/${storagePath}`;

          const { error: insertError } = await supabase.from("vehicle_images").insert({
            vehicle_id: vehicle.id,
            url,
            is_primary: idx === 0,
            sort_order: idx,
            alt: `${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${idx + 1}`,
          });

          if (insertError) {
            console.warn(`[Seed] Warning: image record insert failed: ${insertError.message}`);
            continue;
          }

          totalImages++;
        } catch (imgErr) {
          console.warn(`[Seed] Warning: image error for ${vehicle.stock_number} (${idx}):`, imgErr);
        }

        await sleep(100); // rate-limit picsum.photos
      }
      console.log(`[Seed] Uploaded images for vehicle ${vehicle.stock_number}`);
    } catch (err) {
      console.warn(`[Seed] Warning: image upload failed for ${vehicle.stock_number}:`, err);
    }
  }

  console.log(`[Seed] Uploaded ${totalImages} vehicle images total`);
  return totalImages;
}

// ---------------------------------------------------------------------------
// Seed customers
// ---------------------------------------------------------------------------

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

async function seedCustomers(): Promise<CustomerRow[]> {
  console.log("[Seed] Seeding customers...");

  const customerInserts: Database["public"]["Tables"]["customers"]["Insert"][] = CUSTOMER_FIRST_NAMES.map(
    (firstName, i) => {
      const lastName = CUSTOMER_LAST_NAMES[i];
      const hasFullAddress = Math.random() > 0.3;
      return {
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `555-${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
        ...(hasFullAddress
          ? {
              address: `${randomInt(100, 9999)} ${randomPick(["Main St", "Oak Ave", "Elm Dr", "Pine Rd", "Cedar Ln"])}`,
              city: randomPick(["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"]),
              state: "TX",
              zip: String(randomInt(70000, 79999)),
            }
          : {}),
      };
    }
  );

  const { data: customers, error } = await supabase
    .from("customers")
    .insert(customerInserts)
    .select();

  if (error) {
    console.error("[Seed] Error seeding customers:", error.message);
    return [];
  }

  console.log(`[Seed] Seeded ${customers.length} customers`);
  return customers;
}

// ---------------------------------------------------------------------------
// Seed leads
// ---------------------------------------------------------------------------

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

async function seedLeads(
  customers: CustomerRow[],
  vehicles: VehicleRow[],
  staffUserIds: string[]
): Promise<LeadRow[]> {
  console.log("[Seed] Seeding leads...");

  const leadInserts: Database["public"]["Tables"]["leads"]["Insert"][] = [];

  for (let i = 0; i < 25; i++) {
    const linkToCustomer = i < customers.length && Math.random() > 0.4;
    const customer = linkToCustomer ? customers[i % customers.length] : null;
    const vehicle = vehicles[i % vehicles.length];

    leadInserts.push({
      first_name: customer?.first_name ?? randomPick(CUSTOMER_FIRST_NAMES),
      last_name: customer?.last_name ?? randomPick(CUSTOMER_LAST_NAMES),
      email: customer?.email ?? `lead${i + 1}@example.com`,
      phone: customer?.phone ?? `555-${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
      customer_id: customer?.id ?? null,
      status: randomPick([...LEAD_STATUSES]),
      source: randomPick([...LEAD_SOURCES]),
      vehicle_interest: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      assigned_to: staffUserIds.length > 0 ? staffUserIds[i % staffUserIds.length] : null,
      notes: randomPick([
        "Interested in financing options",
        "Looking for a family vehicle",
        "Wants to trade in current car",
        "Price-sensitive buyer",
        "Repeat customer referral",
        null,
      ]),
    });
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .insert(leadInserts)
    .select();

  if (error) {
    console.error("[Seed] Error seeding leads:", error.message);
    return [];
  }

  console.log(`[Seed] Seeded ${leads.length} leads`);
  return leads;
}

// ---------------------------------------------------------------------------
// Seed deals
// ---------------------------------------------------------------------------

type DealRow = Database["public"]["Tables"]["deals"]["Row"];

async function seedDeals(
  vehicles: VehicleRow[],
  customers: CustomerRow[],
  staffUserIds: string[]
): Promise<DealRow[]> {
  console.log("[Seed] Seeding deals...");

  const soldVehicles = vehicles.filter((v) => v.status === "sold");
  const dealInserts: Database["public"]["Tables"]["deals"]["Insert"][] = [];

  for (let i = 0; i < Math.min(10, soldVehicles.length); i++) {
    const vehicle = soldVehicles[i % soldVehicles.length];
    const customer = customers[i % customers.length];
    const saleType = randomPick(["cash", "finance"]);
    const sellingPrice = vehicle.selling_price ?? randomInt(10000, 40000);
    const taxRate = 6.25;
    const taxAmount = Math.round(sellingPrice * (taxRate / 100) * 100) / 100;
    const docFee = 150;
    const titleFee = 33;
    const registrationFee = 75;
    const totalPrice = sellingPrice + taxAmount + docFee + titleFee + registrationFee;

    const isFinanced = saleType === "finance";
    const apr = isFinanced ? randomPick([3.9, 4.9, 5.9, 6.9, 7.9, 8.9]) : null;
    const term = isFinanced ? randomPick([36, 48, 60, 72]) : null;
    const downPayment = isFinanced ? Math.round(totalPrice * randomInt(10, 25) / 100) : null;
    const amountFinanced = isFinanced && downPayment != null ? totalPrice - downPayment : null;

    // Calculate monthly payment: M = P[r(1+r)^n]/[(1+r)^n-1]
    let monthlyPayment: number | null = null;
    if (isFinanced && apr != null && term != null && amountFinanced != null) {
      const monthlyRate = apr / 100 / 12;
      const factor = Math.pow(1 + monthlyRate, term);
      monthlyPayment = Math.round((amountFinanced * monthlyRate * factor) / (factor - 1) * 100) / 100;
    }

    dealInserts.push({
      deal_number: `TLC-D-${String(i + 1).padStart(4, "0")}`,
      vehicle_id: vehicle.id,
      customer_id: customer.id,
      sale_type: saleType,
      status: randomPick([...DEAL_STATUSES]),
      selling_price: sellingPrice,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      doc_fee: docFee,
      title_fee: titleFee,
      registration_fee: registrationFee,
      total_price: totalPrice,
      down_payment: downPayment,
      amount_financed: amountFinanced,
      apr,
      term,
      monthly_payment: monthlyPayment,
      sale_date: new Date(Date.now() - randomInt(1, 60) * 86400000).toISOString().split("T")[0],
      created_by: staffUserIds.length > 0 ? staffUserIds[i % staffUserIds.length] : null,
    });
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .insert(dealInserts)
    .select();

  if (error) {
    console.error("[Seed] Error seeding deals:", error.message);
    return [];
  }

  console.log(`[Seed] Seeded ${deals.length} deals`);
  return deals;
}

// ---------------------------------------------------------------------------
// Seed follow-ups
// ---------------------------------------------------------------------------

async function seedFollowUps(leads: LeadRow[], staffUserIds: string[]): Promise<number> {
  console.log("[Seed] Seeding follow-ups...");

  const followUpInserts: Database["public"]["Tables"]["follow_ups"]["Insert"][] = [];

  // Create ~15 follow-ups distributed across leads
  for (let i = 0; i < 15; i++) {
    const lead = leads[i % leads.length];
    const isCompleted = Math.random() > 0.4;
    const daysOffset = isCompleted ? -randomInt(1, 30) : randomInt(1, 14);
    const dueDate = new Date(Date.now() + daysOffset * 86400000).toISOString().split("T")[0];

    const followUpType = randomPick([...FOLLOW_UP_TYPES]);
    const content = {
      note: randomPick([
        "Customer expressed interest in financing",
        "Discussed trade-in value for current vehicle",
        "Customer comparing prices with competitor",
        "Left voicemail, waiting for callback",
      ]),
      call: randomPick([
        "Follow up on test drive appointment",
        "Check on financing application status",
        "Discuss available inventory matching preferences",
        "Return customer call regarding pricing",
      ]),
      email: randomPick([
        "Sent vehicle spec sheet and pricing details",
        "Sent financing pre-approval information",
        "Shared new inventory matching customer criteria",
        "Sent appointment confirmation for Saturday",
      ]),
      appointment: randomPick([
        "Test drive scheduled for the weekend",
        "Meeting to review financing options",
        "Trade-in appraisal appointment",
        "Delivery appointment for purchased vehicle",
      ]),
    }[followUpType];

    // Use the lead's assigned_to user as the follow-up creator
    const createdBy = lead.assigned_to ?? (staffUserIds.length > 0 ? staffUserIds[i % staffUserIds.length] : null);

    followUpInserts.push({
      lead_id: lead.id,
      type: followUpType,
      content,
      completed: isCompleted,
      due_date: dueDate,
      created_by: createdBy,
    });
  }

  const { data: followUps, error } = await supabase
    .from("follow_ups")
    .insert(followUpInserts)
    .select();

  if (error) {
    console.error("[Seed] Error seeding follow-ups:", error.message);
    return 0;
  }

  console.log(`[Seed] Seeded ${followUps.length} follow-ups`);
  return followUps.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("[Seed] Starting seed process...");
  console.log(`[Seed] Target: ${SUPABASE_URL}`);

  // Clean existing data
  await cleanExistingData();

  // Fetch staff users for assigned_to / created_by
  let staffUserIds: string[] = [];
  try {
    const { data: authResponse } = await supabase.auth.admin.listUsers();
    const staffUsers = authResponse?.users ?? [];
    staffUserIds = staffUsers.map((u) => u.id);
    if (staffUserIds.length === 0) {
      console.warn("[Seed] Warning: no auth.users found. assigned_to/created_by will be null.");
    } else {
      console.log(`[Seed] Found ${staffUserIds.length} auth user(s) for assignment`);
    }
  } catch (err) {
    console.warn("[Seed] Warning: could not fetch auth users:", err);
  }

  // Seed data in dependency order
  let vehicles: VehicleRow[] = [];
  try {
    vehicles = await seedVehicles();
  } catch (err) {
    console.error("[Seed] Error in seedVehicles:", err);
  }

  let totalImages = 0;
  try {
    totalImages = await uploadVehicleImages(vehicles);
  } catch (err) {
    console.error("[Seed] Error in uploadVehicleImages:", err);
  }

  let customers: CustomerRow[] = [];
  try {
    customers = await seedCustomers();
  } catch (err) {
    console.error("[Seed] Error in seedCustomers:", err);
  }

  let leads: LeadRow[] = [];
  try {
    leads = await seedLeads(customers, vehicles, staffUserIds);
  } catch (err) {
    console.error("[Seed] Error in seedLeads:", err);
  }

  let deals: DealRow[] = [];
  try {
    deals = await seedDeals(vehicles, customers, staffUserIds);
  } catch (err) {
    console.error("[Seed] Error in seedDeals:", err);
  }

  let followUpCount = 0;
  try {
    followUpCount = await seedFollowUps(leads, staffUserIds);
  } catch (err) {
    console.error("[Seed] Error in seedFollowUps:", err);
  }

  // Summary
  console.log("");
  console.log("[Seed] Complete!");
  console.log(`[Seed]   Vehicles: ${vehicles.length}`);
  console.log(`[Seed]   Vehicle Images: ${totalImages}`);
  console.log(`[Seed]   Customers: ${customers.length}`);
  console.log(`[Seed]   Leads: ${leads.length}`);
  console.log(`[Seed]   Deals: ${deals.length}`);
  console.log(`[Seed]   Follow-ups: ${followUpCount}`);
}

main().catch((err) => {
  console.error("[Seed] Fatal error:", err);
  process.exit(1);
});
