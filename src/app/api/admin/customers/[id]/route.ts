import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      deals: {
        include: { vehicle: { select: { id: true, year: true, make: true, model: true, stockNumber: true } } },
        orderBy: { saleDate: "desc" },
      },
      leads: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const customer = await prisma.customer.update({ where: { id }, data: body });
  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
