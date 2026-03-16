import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  Palette,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchInventory } from "@/lib/inventory";
import { CONTACT } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicles = await fetchInventory();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) return { title: "Vehicle Not Found" };

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
    description: vehicle.description,
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicles = await fetchInventory();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) notFound();

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/50">
        <div className="container mx-auto px-4 py-3">
          <Link
            href="/inventory"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Inventory
          </Link>
        </div>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {vehicle.images.length > 0 ? (
                  <Image
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Car className="h-24 w-24 text-muted-foreground/20" />
                    <span className="ml-4 text-muted-foreground">
                      Photos coming soon
                    </span>
                  </div>
                )}
              </div>

              {/* Image thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {vehicle.images.slice(1, 6).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        src={img}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Photo ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {vehicle.description}
                </p>
              </div>

              {/* Specs Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <SpecItem icon={Calendar} label="Year" value={vehicle.year.toString()} />
                    <SpecItem icon={Car} label="Make" value={vehicle.make} />
                    <SpecItem icon={Car} label="Model" value={`${vehicle.model} ${vehicle.trim}`} />
                    <SpecItem icon={Gauge} label="Mileage" value={`${vehicle.mileage.toLocaleString()} mi`} />
                    <SpecItem icon={Settings2} label="Transmission" value={vehicle.transmission} />
                    <SpecItem icon={Fuel} label="Fuel Type" value={vehicle.fuelType} />
                    <SpecItem icon={Car} label="Drivetrain" value={vehicle.drivetrain} />
                    <SpecItem icon={Car} label="Engine" value={vehicle.engine} />
                    <SpecItem icon={Car} label="Body Style" value={vehicle.bodyStyle} />
                    <SpecItem icon={Palette} label="Exterior" value={vehicle.exteriorColor} />
                    <SpecItem icon={Palette} label="Interior" value={vehicle.interiorColor} />
                    <SpecItem icon={Car} label="Stock #" value={vehicle.stockNumber} />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              {vehicle.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="mb-2">
                    {vehicle.bodyStyle}
                  </Badge>
                  <h1 className="text-2xl font-bold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-muted-foreground">{vehicle.trim}</p>

                  <p className="mt-4 text-4xl font-bold text-primary">
                    ${vehicle.price.toLocaleString()}
                  </p>

                  <div className="mt-6 space-y-3">
                    <Button asChild size="lg" className="w-full">
                      <a href={`tel:${CONTACT.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call {CONTACT.phone}
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full">
                      <a href={`mailto:${CONTACT.email}?subject=Inquiry: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.stockNumber})`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Us
                      </a>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="w-full">
                      <Link href="/financing">Get Pre-Approved</Link>
                    </Button>
                  </div>

                  <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
                    <p>VIN: {vehicle.vin}</p>
                    <p className="mt-1">Stock #: {vehicle.stockNumber}</p>
                    <p className="mt-3">
                      Price does not include tax, title, license, or dealer fees.
                      Contact us for complete pricing details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
