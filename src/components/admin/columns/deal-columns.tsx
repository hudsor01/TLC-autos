"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface DealRow {
  id: string;
  dealNumber: string;
  saleType: string;
  totalPrice: number;
  status: string;
  saleDate: string;
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    stockNumber: string;
  } | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

function formatSaleType(saleType: string): string {
  if (saleType === "bhph") return "BHPH";
  return saleType.charAt(0).toUpperCase() + saleType.slice(1);
}

export function getDealColumns(callbacks: {
  onDelete: (deal: DealRow) => void;
}): ColumnDef<DealRow, unknown>[] {
  return [
    {
      id: "customer",
      accessorFn: (row) =>
        row.customer
          ? `${row.customer.firstName} ${row.customer.lastName}`
          : "Unknown",
      header: "Customer",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      id: "vehicle",
      accessorFn: (row) =>
        row.vehicle
          ? `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model}`
          : "Unknown",
      header: "Vehicle",
      cell: ({ row: tableRow }) => {
        const vehicle = tableRow.original.vehicle;
        if (!vehicle) return "Unknown";
        return (
          <div>
            <div>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="text-sm text-muted-foreground">
              Stock #{vehicle.stockNumber}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "saleType",
      header: "Type",
      cell: ({ row }) => formatSaleType(row.getValue("saleType") as string),
    },
    {
      accessorKey: "totalPrice",
      header: "Amount",
      cell: ({ row }) => {
        const price = row.getValue("totalPrice") as number;
        return `$${price.toLocaleString()}`;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "completed"
            ? "default"
            : status === "pending"
              ? "secondary"
              : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <a
            href={`/admin/deals/${row.original.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              callbacks.onDelete(row.original);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
