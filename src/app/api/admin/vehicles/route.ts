import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { make: { contains: search } },
      { model: { contains: search } },
      { stockNumber: { contains: search } },
      { vin: { contains: search } },
    ];
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { dateAdded: "desc" },
      skip,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return NextResponse.json({
    vehicles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Auto-generate stock number if not provided
  if (!body.stockNumber) {
    const lastVehicle = await prisma.vehicle.findFirst({
      orderBy: { stockNumber: "desc" },
      select: { stockNumber: true },
    });
    const lastNum = lastVehicle
      ? parseInt(lastVehicle.stockNumber.replace(/\D/g, "")) || 0
      : 0;
    body.stockNumber = `TLC-${String(lastNum + 1).padStart(3, "0")}`;
  }

  // Calculate total cost
  body.totalCost =
    (body.purchasePrice || 0) +
    (body.buyerFee || 0) +
    (body.lotFee || 0) +
    (body.addedCosts || 0);

  const vehicle = await prisma.vehicle.create({ data: body });

  return NextResponse.json(vehicle, { status: 201 });
}
