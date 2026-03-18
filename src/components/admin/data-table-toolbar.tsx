"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface StatusOption {
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions?: StatusOption[];
  status?: string;
  onStatusChange?: (value: string) => void;
  onClear?: () => void;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  statusOptions,
  status,
  onStatusChange,
  onClear,
}: DataTableToolbarProps) {
  const hasActiveFilters = search || status;

  return (
    <div className="flex items-center gap-2 py-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {statusOptions && onStatusChange && (
        <Select
          value={status ?? ""}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-[160px]"
        >
          <option value="">All</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )}

      {hasActiveFilters && onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-10 px-2"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
