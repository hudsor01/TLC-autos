import CustomerForm from "@/components/admin/customer-form"

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Customer</h1>
      <CustomerForm />
    </div>
  )
}
