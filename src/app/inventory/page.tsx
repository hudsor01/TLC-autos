import type { Metadata } from "next";
import { Suspense } from "react";
import { InventoryClient } from "./inventory-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse our selection of quality pre-owned vehicles. Trucks, SUVs, sedans, and more at TLC Autos in North Texas.",
};

function VehicleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="pt-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-1/3" />
      </CardContent>
    </Card>
  );
}

function InventorySkeletonGrid() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function InventoryPage() {
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

      <Suspense fallback={<InventorySkeletonGrid />}>
        <InventoryClient />
      </Suspense>
    </>
  );
}
