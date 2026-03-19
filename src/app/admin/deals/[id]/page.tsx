"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DealForm from "@/components/admin/deal-form"
import type { DealFormValues } from "@/lib/schemas"

export default function EditDealPage() {
  const params = useParams()
  const id = params.id as string

  const [initialData, setInitialData] = useState<(DealFormValues & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/admin/deals/${id}`)
        if (!res.ok) throw new Error("Failed to fetch deal")
        const data = await res.json()
        setInitialData({
          id: data.id,
          vehicleId: data.vehicleId ?? data.vehicle?.id ?? "",
          customerId: data.customerId ?? data.customer?.id ?? "",
          saleType: data.saleType ?? "cash",
          sellingPrice: data.sellingPrice ?? 0,
          tradeAllowance: data.tradeAllowance ?? 0,
          tradePayoff: data.tradePayoff ?? 0,
          downPayment: data.downPayment ?? 0,
          taxRate: data.taxRate ?? 0,
          titleFee: data.titleFee ?? 0,
          registrationFee: data.registrationFee ?? 0,
          docFee: data.docFee ?? 0,
          otherFees: data.otherFees ?? 0,
          apr: data.apr ?? 0,
          term: data.term ?? 0,
          notes: data.notes ?? "",
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load deal")
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [id])

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading deal...
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {error || "Deal not found."}
      </div>
    )
  }

  return <DealForm initialData={initialData} />
}
