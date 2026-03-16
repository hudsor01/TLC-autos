import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    totalVehicles,
    availableVehicles,
    pendingVehicles,
    soldVehicles,
    totalCustomers,
    activeLeads,
    totalDeals,
    recentVehicles,
    recentLeads,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "available" } }),
    prisma.vehicle.count({ where: { status: "pending" } }),
    prisma.vehicle.count({ where: { status: "sold" } }),
    prisma.customer.count(),
    prisma.lead.count({ where: { status: { in: ["new", "contacted", "qualified"] } } }),
    prisma.deal.count({ where: { status: "completed" } }),
    prisma.vehicle.findMany({
      take: 5,
      orderBy: { dateAdded: "desc" },
      select: { id: true, stockNumber: true, year: true, make: true, model: true, sellingPrice: true, status: true, dateAdded: true },
    }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, source: true, status: true, vehicleInterest: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalVehicles,
      availableVehicles,
      pendingVehicles,
      soldVehicles,
      totalCustomers,
      activeLeads,
      totalDeals,
    },
    recentVehicles,
    recentLeads,
  });
}
