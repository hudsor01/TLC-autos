/**
 * Frazer CRM Integration
 *
 * Frazer is a popular dealer management system (DMS) for independent used car dealers.
 * It can export inventory data as XML feeds that can be consumed by websites.
 *
 * Integration options:
 * 1. XML Feed: Frazer exports inventory to an XML file (typically hosted on their servers
 *    or uploaded via FTP). This module fetches and parses that feed.
 * 2. CSV Export: Frazer can also export to CSV which can be placed on a server.
 * 3. Frazer API: For dealers with Frazer's web-enabled features.
 *
 * Configuration:
 * Set the FRAZER_FEED_URL environment variable to your Frazer inventory feed URL.
 * Example: https://www.fraaborea.com/feed/yourdealercode/inventory.xml
 */

export interface Vehicle {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  mileage: number;
  price: number;
  description: string;
  images: string[];
  status: "available" | "pending" | "sold";
  transmission: string;
  engine: string;
  drivetrain: string;
  fuelType: string;
  features: string[];
  dateAdded: string;
}

/**
 * Sample inventory data used when the Frazer CRM feed is not yet configured.
 * Replace this with live data once FRAZER_FEED_URL is set.
 */
const SAMPLE_INVENTORY: Vehicle[] = [
  {
    id: "1",
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
    price: 38995,
    description: "Well-maintained Ford F-150 XLT with EcoBoost engine. Features include tow package, bed liner, and backup camera.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "2.7L V6 EcoBoost",
    drivetrain: "4WD",
    fuelType: "Gasoline",
    features: ["Tow Package", "Bed Liner", "Backup Camera", "Bluetooth", "Apple CarPlay"],
    dateAdded: "2026-03-01",
  },
  {
    id: "2",
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
    price: 24995,
    description: "Sporty and reliable Toyota Camry SE. Great on gas with a comfortable ride. One owner, clean CarFax.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "2.5L 4-Cylinder",
    drivetrain: "FWD",
    fuelType: "Gasoline",
    features: ["Sunroof", "Lane Departure Warning", "Adaptive Cruise Control", "Keyless Entry"],
    dateAdded: "2026-03-05",
  },
  {
    id: "3",
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
    price: 42995,
    description: "Spacious Chevrolet Tahoe LT with 3rd row seating. Perfect family vehicle with plenty of room and towing capacity.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "5.3L V8",
    drivetrain: "RWD",
    fuelType: "Gasoline",
    features: ["3rd Row Seating", "Leather Seats", "Navigation", "Bose Sound System", "Power Liftgate"],
    dateAdded: "2026-02-20",
  },
  {
    id: "4",
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
    price: 32495,
    description: "Nearly new Honda CR-V EX-L with low miles. Loaded with features including heated leather seats and Honda Sensing suite.",
    images: [],
    status: "available",
    transmission: "CVT",
    engine: "1.5L Turbo 4-Cylinder",
    drivetrain: "AWD",
    fuelType: "Gasoline",
    features: ["Heated Seats", "Leather", "Honda Sensing", "Wireless CarPlay", "Panoramic Sunroof"],
    dateAdded: "2026-03-10",
  },
  {
    id: "5",
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
    price: 29995,
    description: "Rugged Chevrolet Silverado 1500 Custom with V8 power. Work-ready with a clean interior and runs strong.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "5.3L V8",
    drivetrain: "4WD",
    fuelType: "Gasoline",
    features: ["Trailer Hitch", "Bed Liner", "Bluetooth", "Backup Camera", "Running Boards"],
    dateAdded: "2026-02-15",
  },
  {
    id: "6",
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
    price: 21495,
    description: "Fuel-efficient Nissan Altima SV with great tech features. AWD option makes it perfect for all-weather driving.",
    images: [],
    status: "available",
    transmission: "CVT",
    engine: "2.5L 4-Cylinder",
    drivetrain: "FWD",
    fuelType: "Gasoline",
    features: ["Blind Spot Monitor", "Remote Start", "Android Auto", "Apple CarPlay", "Heated Seats"],
    dateAdded: "2026-03-08",
  },
  {
    id: "7",
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
    price: 37995,
    description: "Adventure-ready Toyota Tacoma TRD Off-Road. Crawl control, locking diff, and all the off-road goodies.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "3.5L V6",
    drivetrain: "4WD",
    fuelType: "Gasoline",
    features: ["Crawl Control", "Locking Rear Diff", "TRD Suspension", "Multi-Terrain Select", "Dashcam"],
    dateAdded: "2026-03-12",
  },
  {
    id: "8",
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
    price: 22995,
    description: "Reliable Hyundai Tucson SEL with remaining factory warranty. Great value compact SUV with all the essentials.",
    images: [],
    status: "available",
    transmission: "Automatic",
    engine: "2.4L 4-Cylinder",
    drivetrain: "FWD",
    fuelType: "Gasoline",
    features: ["Blind Spot Detection", "Lane Keep Assist", "Apple CarPlay", "Heated Seats", "Power Liftgate"],
    dateAdded: "2026-02-28",
  },
];

/**
 * Fetch inventory from Frazer CRM feed.
 * Falls back to sample data if FRAZER_FEED_URL is not configured.
 *
 * To connect your Frazer CRM:
 * 1. In Frazer, go to Reports > Internet > Website Export
 * 2. Configure the export format (XML recommended)
 * 3. Set up automatic export schedule
 * 4. Set FRAZER_FEED_URL in your .env.local file to the export URL
 */
export async function fetchInventory(): Promise<Vehicle[]> {
  const feedUrl = process.env.FRAZER_FEED_URL;

  if (!feedUrl) {
    console.log(
      "FRAZER_FEED_URL not configured. Using sample inventory data. " +
        "Set this environment variable to connect to your Frazer CRM feed."
    );
    return SAMPLE_INVENTORY;
  }

  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Frazer feed returned ${response.status}`);
      return SAMPLE_INVENTORY;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("xml")) {
      return parseFrazerXml(await response.text());
    } else if (contentType.includes("json")) {
      return parseFrazerJson(await response.json());
    } else {
      // Try to parse as XML by default (most common Frazer export)
      return parseFrazerXml(await response.text());
    }
  } catch (error) {
    console.error("Failed to fetch Frazer inventory feed:", error);
    return SAMPLE_INVENTORY;
  }
}

/**
 * Parse Frazer XML feed into Vehicle objects.
 * Frazer's XML format typically includes vehicle nodes with standard DMS fields.
 * Adjust field mappings as needed for your specific Frazer export configuration.
 */
function parseFrazerXml(xml: string): Vehicle[] {
  // This is a simplified XML parser for the Frazer feed format.
  // For production, consider using a proper XML parsing library like 'fast-xml-parser'.
  const vehicles: Vehicle[] = [];
  const vehicleRegex = /<vehicle>([\s\S]*?)<\/vehicle>/gi;
  let match;

  while ((match = vehicleRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string): string => {
      const m = new RegExp(`<${tag}>(.*?)</${tag}>`, "i").exec(block);
      return m ? m[1].trim() : "";
    };

    vehicles.push({
      id: get("stocknumber") || get("id") || String(vehicles.length + 1),
      stockNumber: get("stocknumber"),
      vin: get("vin"),
      year: parseInt(get("year")) || 0,
      make: get("make"),
      model: get("model"),
      trim: get("trim"),
      bodyStyle: get("bodystyle") || get("body"),
      exteriorColor: get("exteriorcolor") || get("color"),
      interiorColor: get("interiorcolor"),
      mileage: parseInt(get("mileage") || get("odometer")) || 0,
      price: parseFloat(get("price") || get("sellingprice")) || 0,
      description: get("description") || get("comments"),
      images: get("photos")
        ? get("photos").split(",").map((s) => s.trim())
        : get("photo")
          ? [get("photo")]
          : [],
      status: "available",
      transmission: get("transmission"),
      engine: get("engine"),
      drivetrain: get("drivetrain") || get("drive"),
      fuelType: get("fueltype") || get("fuel"),
      features: get("options")
        ? get("options").split(",").map((s) => s.trim())
        : [],
      dateAdded: get("dateinstock") || get("dateadded") || new Date().toISOString().split("T")[0],
    });
  }

  return vehicles;
}

/**
 * Parse Frazer JSON feed (if using a JSON export format).
 */
function parseFrazerJson(data: Record<string, unknown>): Vehicle[] {
  const items = Array.isArray(data) ? data : (data as Record<string, unknown[]>).vehicles || (data as Record<string, unknown[]>).inventory || [];

  return (items as Record<string, unknown>[]).map((item, index) => ({
    id: String(item.stockNumber || item.id || index + 1),
    stockNumber: String(item.stockNumber || item.stock_number || ""),
    vin: String(item.vin || ""),
    year: Number(item.year) || 0,
    make: String(item.make || ""),
    model: String(item.model || ""),
    trim: String(item.trim || ""),
    bodyStyle: String(item.bodyStyle || item.body_style || item.body || ""),
    exteriorColor: String(item.exteriorColor || item.exterior_color || item.color || ""),
    interiorColor: String(item.interiorColor || item.interior_color || ""),
    mileage: Number(item.mileage || item.odometer) || 0,
    price: Number(item.price || item.sellingPrice || item.selling_price) || 0,
    description: String(item.description || item.comments || ""),
    images: Array.isArray(item.images) ? item.images as string[] : Array.isArray(item.photos) ? item.photos as string[] : [],
    status: "available" as const,
    transmission: String(item.transmission || ""),
    engine: String(item.engine || ""),
    drivetrain: String(item.drivetrain || item.drive || ""),
    fuelType: String(item.fuelType || item.fuel_type || item.fuel || ""),
    features: Array.isArray(item.features) ? item.features as string[] : Array.isArray(item.options) ? item.options as string[] : [],
    dateAdded: String(item.dateAdded || item.date_in_stock || new Date().toISOString().split("T")[0]),
  }));
}

/**
 * Get unique values for filter dropdowns.
 */
export function getFilterOptions(vehicles: Vehicle[]) {
  return {
    makes: [...new Set(vehicles.map((v) => v.make))].sort(),
    bodyStyles: [...new Set(vehicles.map((v) => v.bodyStyle))].sort(),
    years: [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a),
    priceRanges: [
      { label: "Under $20,000", min: 0, max: 20000 },
      { label: "$20,000 - $30,000", min: 20000, max: 30000 },
      { label: "$30,000 - $40,000", min: 30000, max: 40000 },
      { label: "$40,000+", min: 40000, max: Infinity },
    ],
  };
}
