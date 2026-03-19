"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table";
import { DataTablePagination } from "@/components/admin/data-table-pagination";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { useTableFilters, buildApiParams } from "@/hooks/use-table-filters";
import {
  getLeadColumns,
  type LeadRow,
} from "@/components/admin/columns/lead-columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Plus } from "lucide-react";
import type { SortingState, PaginationState } from "@tanstack/react-table";

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Lost", value: "lost" },
  { label: "Converted", value: "converted" },
];

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}

function LeadsContent() {
  const router = useRouter();
  const [filters, setFilters] = useTableFilters({
    defaultSort: "created_at",
  });

  const [data, setData] = useState<LeadRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<LeadRow | null>(null);

  const sorting: SortingState = [
    { id: filters.sort, desc: filters.order === "desc" },
  ];
  const pagination: PaginationState = {
    pageIndex: filters.page - 1,
    pageSize: 20,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildApiParams(filters);
      const res = await fetch(`/api/admin/leads?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json.leads);
      setPageCount(json.pagination.totalPages);
      setTotalItems(json.pagination.total);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSortingChange(
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    if (next.length > 0) {
      setFilters({
        sort: next[0].id,
        order: next[0].desc ? "desc" : "asc",
        page: 1,
      });
    }
  }

  function handlePaginationChange(
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue;
    setFilters({ page: next.pageIndex + 1 });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    toast.promise(
      fetch(`/api/admin/leads/${deleteTarget.id}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
      }),
      {
        loading: "Deleting lead...",
        success: () => {
          setDeleteTarget(null);
          fetchData();
          return "Lead deleted";
        },
        error: "Failed to delete lead",
      }
    );
  }

  const columns = getLeadColumns({ onDelete: setDeleteTarget });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Leads</h1>
        </div>
        <Button asChild>
          <Link href="/admin/leads/new">
            <Plus className="mr-1 h-4 w-4" /> Add Lead
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTableToolbar
            search={filters.search}
            onSearchChange={(v) => setFilters({ search: v, page: 1 })}
            statusOptions={STATUS_OPTIONS}
            status={filters.status}
            onStatusChange={(v) => setFilters({ status: v, page: 1 })}
            onClear={() => setFilters({ search: "", status: "", page: 1 })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            pageCount={pageCount}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            isLoading={loading}
            onRowClick={(row) => router.push(`/admin/leads/${row.id}`)}
          />
        </CardContent>
      </Card>

      {pageCount > 1 && (
        <DataTablePagination
          pageIndex={pagination.pageIndex}
          pageCount={pageCount}
          onPageChange={(p) => setFilters({ page: p + 1 })}
          totalItems={totalItems}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>
              {deleteTarget?.firstName} {deleteTarget?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
