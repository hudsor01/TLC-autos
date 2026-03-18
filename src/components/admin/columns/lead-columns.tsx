"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface LeadRow {
  id: string;
  firstName: string;
  lastName: string;
  source: string;
  status: string;
  createdAt: string;
  customer: { id: string; firstName: string; lastName: string } | null;
}

export function getLeadColumns(callbacks: {
  onDelete: (lead: LeadRow) => void;
}): ColumnDef<LeadRow, unknown>[] {
  return [
    {
      id: "name",
      accessorFn: (row) =>
        row.customer
          ? `${row.customer.firstName} ${row.customer.lastName}`
          : `${row.firstName} ${row.lastName}`,
      header: "Customer",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "new"
            ? "secondary"
            : status === "contacted" || status === "qualified"
              ? "default"
              : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const value = row.getValue("createdAt") as string;
        return new Date(value).toLocaleDateString();
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <a
            href={`/admin/leads/${row.original.id}`}
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
