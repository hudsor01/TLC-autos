import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const followUps = await prisma.followUp.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(followUps);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();

  const followUp = await prisma.followUp.create({
    data: { ...body, leadId: id },
  });

  return NextResponse.json(followUp, { status: 201 });
}
