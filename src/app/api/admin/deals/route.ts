import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        vehicle: { select: { id: true, year: true, make: true, model: true, stockNumber: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.deal.count({ where }),
  ]);

  return NextResponse.json({
    deals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Auto-generate deal number
  if (!body.dealNumber) {
    const lastDeal = await prisma.deal.findFirst({
      orderBy: { dealNumber: "desc" },
      select: { dealNumber: true },
    });
    const lastNum = lastDeal
      ? parseInt(lastDeal.dealNumber.replace(/\D/g, "")) || 0
      : 0;
    body.dealNumber = `D-${String(lastNum + 1).padStart(4, "0")}`;
  }

  // Calculate tax amount
  const taxableAmount = (body.sellingPrice || 0) - (body.tradeAllowance || 0);
  body.taxAmount = Math.max(0, taxableAmount) * ((body.taxRate || 6.25) / 100);

  // Calculate total price
  body.totalPrice =
    (body.sellingPrice || 0) -
    (body.tradeAllowance || 0) +
    (body.tradePayoff || 0) +
    body.taxAmount +
    (body.titleFee || 0) +
    (body.registrationFee || 0) +
    (body.docFee || 0) +
    (body.otherFees || 0);

  // Calculate amount financed
  body.amountFinanced = body.totalPrice - (body.downPayment || 0);

  // Calculate monthly payment if financing
  if (body.saleType !== "cash" && body.apr > 0 && body.term > 0) {
    const monthlyRate = body.apr / 100 / 12;
    body.monthlyPayment =
      (body.amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, body.term)) /
      (Math.pow(1 + monthlyRate, body.term) - 1);
    body.monthlyPayment = Math.round(body.monthlyPayment * 100) / 100;
  }

  const deal = await prisma.deal.create({ data: body });

  // Update vehicle status to pending
  if (body.vehicleId) {
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { status: "pending" },
    });
  }

  return NextResponse.json(deal, { status: 201 });
}
