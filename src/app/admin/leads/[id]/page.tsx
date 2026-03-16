"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FollowUp {
  _id: string;
  type: string;
  content: string;
  dueDate?: string;
  createdAt?: string;
}

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  vehicleInterest: string;
  status: string;
  notes: string;
  assignedTo: string;
  followUps?: FollowUp[];
  customerId?: string;
  createdAt?: string;
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "lost"];

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

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({});

  // Follow-up form state
  const [followUpForm, setFollowUpForm] = useState({
    type: "note",
    content: "",
    dueDate: "",
  });
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/admin/leads/${id}`);
        if (!res.ok) throw new Error("Failed to fetch lead");
        const data = await res.json();
        setLead(data);
        setForm(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          notes: form.notes,
          assignedTo: form.assignedTo,
        }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      const data = await res.json();
      setLead(data);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpForm.content.trim()) return;
    setAddingFollowUp(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpForm),
      });
      if (!res.ok) throw new Error("Failed to add follow-up");
      const data = await res.json();
      setLead((prev) =>
        prev
          ? {
              ...prev,
              followUps: [...(prev.followUps || []), data],
            }
          : prev
      );
      setFollowUpForm({ type: "note", content: "", dueDate: "" });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to add follow-up"
      );
    } finally {
      setAddingFollowUp(false);
    }
  };

  const handleConvertToCustomer = async () => {
    if (
      !confirm(
        "Convert this lead to a customer? This will create a customer record and update the lead status."
      )
    )
      return;
    setConverting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}/convert`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to convert lead to customer");
      const data = await res.json();
      setLead((prev) => (prev ? { ...prev, status: "converted", customerId: data.customerId } : prev));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to convert lead"
      );
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading lead...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Lead not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {lead.firstName} {lead.lastName}
          </h1>
          <Badge className={statusBadgeClass(lead.status)}>{lead.status}</Badge>
        </div>
        <div className="flex gap-2">
          {lead.status !== "converted" && (
            <Button onClick={handleConvertToCustomer} disabled={converting}>
              {converting ? "Converting..." : "Convert to Customer"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/admin/leads")}
          >
            Back to Leads
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Lead Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lead Information</CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setForm(lead);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  name="status"
                  value={form.status || ""}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input
                  name="assignedTo"
                  value={form.assignedTo || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  name="notes"
                  value={form.notes || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{lead.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{lead.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p>{lead.source || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Vehicle Interest
                </p>
                <p>{lead.vehicleInterest || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p>{lead.assignedTo || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {lead.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Follow-up Form */}
          <form
            onSubmit={handleAddFollowUp}
            className="space-y-4 rounded-lg border p-4"
          >
            <h3 className="font-medium">Add Follow-up</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={followUpForm.type}
                  onChange={(e) =>
                    setFollowUpForm((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="text">Text</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={followUpForm.dueDate}
                  onChange={(e) =>
                    setFollowUpForm((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={followUpForm.content}
                onChange={(e) =>
                  setFollowUpForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Enter follow-up details..."
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={addingFollowUp}>
              {addingFollowUp ? "Adding..." : "Add Follow-up"}
            </Button>
          </form>

          {/* Follow-up List */}
          {lead.followUps && lead.followUps.length > 0 ? (
            <div className="space-y-4">
              {lead.followUps.map((followUp) => (
                <div
                  key={followUp._id}
                  className="flex gap-4 rounded-lg border p-4"
                >
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="capitalize">
                      {followUp.type}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p>{followUp.content}</p>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      {followUp.createdAt && (
                        <span>
                          Created:{" "}
                          {new Date(followUp.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {followUp.dueDate && (
                        <span>
                          Due:{" "}
                          {new Date(followUp.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No follow-ups yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
