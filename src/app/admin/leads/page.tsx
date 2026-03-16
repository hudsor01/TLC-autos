"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  source: string;
  vehicleInterest: string;
  status: string;
  followUps?: { _id: string }[];
  createdAt?: string;
}

const STATUS_OPTIONS = [
  "all",
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "new":
      return "default";
    case "contacted":
      return "secondary";
    case "qualified":
      return "outline";
    case "converted":
      return "default";
    case "lost":
      return "destructive";
    default:
      return "secondary";
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "new":
      return "bg-blue-500 text-white border-blue-500";
    case "contacted":
      return "bg-yellow-500 text-white border-yellow-500";
    case "qualified":
      return "bg-purple-500 text-white border-purple-500";
    case "converted":
      return "bg-green-500 text-white border-green-500";
    case "lost":
      return "bg-red-500 text-white border-red-500";
    default:
      return "";
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch leads");
        const data = await res.json();
        setLeads(data.leads || data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchLeads, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {STATUS_OPTIONS.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_OPTIONS.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No leads found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Vehicle Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow-ups</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell>{lead.source || "N/A"}</TableCell>
                      <TableCell>{lead.vehicleInterest || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClass(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {lead.followUps?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/leads/${lead._id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
