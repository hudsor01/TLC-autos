import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const costs = await prisma.vehicleCost.findMany({
    where: { vehicleId: id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(costs);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();

  const cost = await prisma.vehicleCost.create({
    data: { ...body, vehicleId: id },
  });

  // Update the vehicle's addedCosts total
  const totalCosts = await prisma.vehicleCost.aggregate({
    where: { vehicleId: id },
    _sum: { amount: true },
  });

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (vehicle) {
    const addedCosts = totalCosts._sum.amount || 0;
    await prisma.vehicle.update({
      where: { id },
      data: {
        addedCosts,
        totalCost: vehicle.purchasePrice + vehicle.buyerFee + vehicle.lotFee + addedCosts,
      },
    });
  }

  return NextResponse.json(cost, { status: 201 });
}
