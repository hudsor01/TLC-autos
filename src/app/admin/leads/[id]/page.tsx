"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import LeadForm from "@/components/admin/lead-form"
import type { LeadFormValues } from "@/lib/schemas"

export default function EditLeadPage() {
  const params = useParams()
  const id = params.id as string

  const [initialData, setInitialData] = useState<(LeadFormValues & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/admin/leads/${id}`)
        if (!res.ok) throw new Error("Failed to fetch lead")
        const data = await res.json()
        setInitialData({
          id: data.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          source: data.source ?? "",
          status: data.status ?? "new",
          vehicleInterest: data.vehicleInterest ?? "",
          notes: data.notes ?? "",
          customerId: data.customerId ?? "",
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load lead")
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading lead...
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {error || "Lead not found."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Lead</h1>
      <LeadForm initialData={initialData} />
    </div>
  )
}
