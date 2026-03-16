import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      costItems: { orderBy: { date: "desc" } },
      deals: {
        include: { customer: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { saleDate: "desc" },
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json(vehicle);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();

  // Recalculate total cost if cost fields are being updated
  if (
    body.purchasePrice !== undefined ||
    body.buyerFee !== undefined ||
    body.lotFee !== undefined ||
    body.addedCosts !== undefined
  ) {
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (existing) {
      body.totalCost =
        (body.purchasePrice ?? existing.purchasePrice) +
        (body.buyerFee ?? existing.buyerFee) +
        (body.lotFee ?? existing.lotFee) +
        (body.addedCosts ?? existing.addedCosts);
    }
  }

  // If marking as sold, set dateSold
  if (body.status === "sold" && !body.dateSold) {
    body.dateSold = new Date();
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(vehicle);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
