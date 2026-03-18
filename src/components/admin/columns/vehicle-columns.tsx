"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface VehicleRow {
  id: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  sellingPrice: number;
  status: string;
}

export function getVehicleColumns(callbacks: {
  onDelete: (vehicle: VehicleRow) => void;
}): ColumnDef<VehicleRow, unknown>[] {
  return [
    {
      accessorKey: "stockNumber",
      header: "Stock #",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("stockNumber")}</span>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "make",
      header: "Make",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("sellingPrice") as number;
        return `$${price.toLocaleString()}`;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "available"
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
            href={`/admin/vehicles/${row.original.id}`}
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
