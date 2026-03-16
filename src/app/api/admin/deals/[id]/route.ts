import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: true,
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  return NextResponse.json(deal);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();

  // If completing a deal, mark vehicle as sold
  if (body.status === "completed") {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (deal) {
      await prisma.vehicle.update({
        where: { id: deal.vehicleId },
        data: { status: "sold", dateSold: new Date() },
      });
    }
  }

  // If voiding a deal, set vehicle back to available
  if (body.status === "voided") {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (deal) {
      await prisma.vehicle.update({
        where: { id: deal.vehicleId },
        data: { status: "available", dateSold: null },
      });
    }
  }

  const deal = await prisma.deal.update({ where: { id }, data: body });
  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Set vehicle back to available
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (deal) {
    await prisma.vehicle.update({
      where: { id: deal.vehicleId },
      data: { status: "available", dateSold: null },
    });
  }

  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
