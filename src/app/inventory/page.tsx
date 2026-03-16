import type { Metadata } from "next";
import { fetchInventory, getFilterOptions } from "@/lib/frazer";
import { InventoryClient } from "./inventory-client";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse our selection of quality pre-owned vehicles. Trucks, SUVs, sedans, and more at TLC Autos in North Texas.",
};

export default async function InventoryPage() {
  const vehicles = await fetchInventory();
  const filterOptions = getFilterOptions(vehicles);

  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Our Inventory
          </h1>
          <p className="mt-2 text-primary-foreground/70">
            Browse our current selection of quality pre-owned vehicles. Updated
            daily from our lot.
          </p>
        </div>
      </section>

      <InventoryClient vehicles={vehicles} filterOptions={filterOptions} />
    </>
  );
}
