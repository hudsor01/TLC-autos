import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { hashSync } from "bcryptjs";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed admin user
  await prisma.user.upsert({
    where: { email: "admin@tlcautos.com" },
    update: {},
    create: {
      email: "admin@tlcautos.com",
      name: "Admin",
      passwordHash: hashSync("changeme", 10),
      role: "admin",
    },
  });

  console.log("Seeded admin user: admin@tlcautos.com / changeme");

  // Seed vehicles (from original Frazer sample data)
  const vehicles = [
    {
      stockNumber: "TLC-001",
      vin: "1FTFW1ET5EKF00001",
      year: 2022,
      make: "Ford",
      model: "F-150",
      trim: "XLT",
      bodyStyle: "Truck",
      exteriorColor: "Oxford White",
      interiorColor: "Medium Earth Gray",
      mileage: 28500,
      sellingPrice: 38995,
      purchasePrice: 32000,
      description: "Well-maintained Ford F-150 XLT with EcoBoost engine. Features include tow package, bed liner, and backup camera.",
      transmission: "Automatic",
      engine: "2.7L V6 EcoBoost",
      drivetrain: "4WD",
      fuelType: "Gasoline",
      vehicleType: "Truck",
      features: JSON.stringify(["Tow Package", "Bed Liner", "Backup Camera", "Bluetooth", "Apple CarPlay"]),
    },
    {
      stockNumber: "TLC-002",
      vin: "5UXWX7C50NL000002",
      year: 2021,
      make: "Toyota",
      model: "Camry",
      trim: "SE",
      bodyStyle: "Sedan",
      exteriorColor: "Midnight Black",
      interiorColor: "Black",
      mileage: 34200,
      sellingPrice: 24995,
      purchasePrice: 19500,
      description: "Sporty and reliable Toyota Camry SE. Great on gas with a comfortable ride. One owner, clean CarFax.",
      transmission: "Automatic",
      engine: "2.5L 4-Cylinder",
      drivetrain: "FWD",
      fuelType: "Gasoline",
      vehicleType: "Sedan",
      features: JSON.stringify(["Sunroof", "Lane Departure Warning", "Adaptive Cruise Control", "Keyless Entry"]),
    },
    {
      stockNumber: "TLC-003",
      vin: "1C4RJFBG8LC000003",
      year: 2020,
      make: "Chevrolet",
      model: "Tahoe",
      trim: "LT",
      bodyStyle: "SUV",
      exteriorColor: "Silver Ice Metallic",
      interiorColor: "Jet Black",
      mileage: 52100,
      sellingPrice: 42995,
      purchasePrice: 35000,
      description: "Spacious Chevrolet Tahoe LT with 3rd row seating. Perfect family vehicle with plenty of room and towing capacity.",
      transmission: "Automatic",
      engine: "5.3L V8",
      drivetrain: "RWD",
      fuelType: "Gasoline",
      vehicleType: "SUV",
      features: JSON.stringify(["3rd Row Seating", "Leather Seats", "Navigation", "Bose Sound System", "Power Liftgate"]),
    },
    {
      stockNumber: "TLC-004",
      vin: "3GNKBKRS2MS000004",
      year: 2023,
      make: "Honda",
      model: "CR-V",
      trim: "EX-L",
      bodyStyle: "SUV",
      exteriorColor: "Radiant Red",
      interiorColor: "Gray",
      mileage: 15800,
      sellingPrice: 32495,
      purchasePrice: 26000,
      description: "Nearly new Honda CR-V EX-L with low miles. Loaded with features including heated leather seats and Honda Sensing suite.",
      transmission: "CVT",
      engine: "1.5L Turbo 4-Cylinder",
      drivetrain: "AWD",
      fuelType: "Gasoline",
      vehicleType: "SUV",
      features: JSON.stringify(["Heated Seats", "Leather", "Honda Sensing", "Wireless CarPlay", "Panoramic Sunroof"]),
    },
    {
      stockNumber: "TLC-005",
      vin: "1GCUYEED3LZ000005",
      year: 2019,
      make: "Chevrolet",
      model: "Silverado 1500",
      trim: "Custom",
      bodyStyle: "Truck",
      exteriorColor: "Havana Brown",
      interiorColor: "Jet Black",
      mileage: 61300,
      sellingPrice: 29995,
      purchasePrice: 23000,
      description: "Rugged Chevrolet Silverado 1500 Custom with V8 power. Work-ready with a clean interior and runs strong.",
      transmission: "Automatic",
      engine: "5.3L V8",
      drivetrain: "4WD",
      fuelType: "Gasoline",
      vehicleType: "Truck",
      features: JSON.stringify(["Trailer Hitch", "Bed Liner", "Bluetooth", "Backup Camera", "Running Boards"]),
    },
    {
      stockNumber: "TLC-006",
      vin: "JTDKN3DU5A0000006",
      year: 2021,
      make: "Nissan",
      model: "Altima",
      trim: "SV",
      bodyStyle: "Sedan",
      exteriorColor: "Gun Metallic",
      interiorColor: "Charcoal",
      mileage: 42600,
      sellingPrice: 21495,
      purchasePrice: 16000,
      description: "Fuel-efficient Nissan Altima SV with great tech features. AWD option makes it perfect for all-weather driving.",
      transmission: "CVT",
      engine: "2.5L 4-Cylinder",
      drivetrain: "FWD",
      fuelType: "Gasoline",
      vehicleType: "Sedan",
      features: JSON.stringify(["Blind Spot Monitor", "Remote Start", "Android Auto", "Apple CarPlay", "Heated Seats"]),
    },
    {
      stockNumber: "TLC-007",
      vin: "5TFCZ5AN1HX000007",
      year: 2022,
      make: "Toyota",
      model: "Tacoma",
      trim: "TRD Off-Road",
      bodyStyle: "Truck",
      exteriorColor: "Army Green",
      interiorColor: "Black",
      mileage: 22400,
      sellingPrice: 37995,
      purchasePrice: 31000,
      description: "Adventure-ready Toyota Tacoma TRD Off-Road. Crawl control, locking diff, and all the off-road goodies.",
      transmission: "Automatic",
      engine: "3.5L V6",
      drivetrain: "4WD",
      fuelType: "Gasoline",
      vehicleType: "Truck",
      features: JSON.stringify(["Crawl Control", "Locking Rear Diff", "TRD Suspension", "Multi-Terrain Select", "Dashcam"]),
    },
    {
      stockNumber: "TLC-008",
      vin: "WBAPH5C55BA000008",
      year: 2020,
      make: "Hyundai",
      model: "Tucson",
      trim: "SEL",
      bodyStyle: "SUV",
      exteriorColor: "Stellar Silver",
      interiorColor: "Gray",
      mileage: 47800,
      sellingPrice: 22995,
      purchasePrice: 17500,
      description: "Reliable Hyundai Tucson SEL with remaining factory warranty. Great value compact SUV with all the essentials.",
      transmission: "Automatic",
      engine: "2.4L 4-Cylinder",
      drivetrain: "FWD",
      fuelType: "Gasoline",
      vehicleType: "SUV",
      features: JSON.stringify(["Blind Spot Detection", "Lane Keep Assist", "Apple CarPlay", "Heated Seats", "Power Liftgate"]),
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { stockNumber: v.stockNumber },
      update: {},
      create: v,
    });
  }

  console.log(`Seeded ${vehicles.length} vehicles`);

  // Seed sample customers
  const customer1 = await prisma.customer.create({
    data: {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus.j@email.com",
      phone: "(555) 234-5678",
      address: "456 Oak Ave",
      city: "Plano",
      state: "TX",
      zip: "75024",
    },
  });

  await prisma.customer.create({
    data: {
      firstName: "Sarah",
      lastName: "Thompson",
      email: "sarah.t@email.com",
      phone: "(555) 345-6789",
      address: "789 Elm St",
      city: "Frisco",
      state: "TX",
      zip: "75034",
    },
  });

  console.log("Seeded 2 sample customers");

  // Seed sample leads
  await prisma.lead.create({
    data: {
      firstName: "David",
      lastName: "Rodriguez",
      email: "david.r@email.com",
      phone: "(555) 456-7890",
      source: "website",
      status: "new",
      vehicleInterest: "Looking for a truck under $35k",
      notes: "Submitted contact form on website",
    },
  });

  await prisma.lead.create({
    data: {
      customerId: customer1.id,
      firstName: customer1.firstName,
      lastName: customer1.lastName,
      email: customer1.email,
      phone: customer1.phone,
      source: "walk-in",
      status: "contacted",
      vehicleInterest: "2022 Ford F-150 XLT (TLC-001)",
      notes: "Came in to test drive the F-150. Very interested.",
    },
  });

  console.log("Seeded 2 sample leads");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
