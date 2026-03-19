"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import CustomerForm from "@/components/admin/customer-form"
import type { CustomerFormValues } from "@/lib/schemas"

export default function EditCustomerPage() {
  const params = useParams()
  const id = params.id as string

  const [initialData, setInitialData] = useState<(CustomerFormValues & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/admin/customers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch customer")
        const data = await res.json()
        setInitialData({
          id: data.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zip: data.zip ?? "",
          driversLicense: data.driversLicense ?? "",
          notes: data.notes ?? "",
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load customer")
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [id])

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading customer...
      </div>
    )
  }

  if (error || !initialData) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {error || "Customer not found."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Customer</h1>
      <CustomerForm initialData={initialData} />
    </div>
  )
}
