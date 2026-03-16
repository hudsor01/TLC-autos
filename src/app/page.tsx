import Link from "next/link";
import {
  Car,
  Shield,
  DollarSign,
  ThumbsUp,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME, CONTACT } from "@/lib/constants";

const FEATURES = [
  {
    icon: Shield,
    title: "Quality Inspected",
    description:
      "Every vehicle undergoes a thorough multi-point inspection before hitting our lot.",
  },
  {
    icon: DollarSign,
    title: "Affordable Financing",
    description:
      "Flexible financing options for every budget. We work with all credit types.",
  },
  {
    icon: ThumbsUp,
    title: "No Pressure Sales",
    description:
      "Our friendly team is here to help — not push. Take your time finding the right ride.",
  },
  {
    icon: Car,
    title: "Wide Selection",
    description:
      "Trucks, SUVs, sedans, and more. We keep a diverse inventory to match your needs.",
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus J.",
    text: "TLC Autos made buying my first truck so easy. Fair price, no games, and they helped me get financed the same day!",
    rating: 5,
  },
  {
    name: "Sarah T.",
    text: "I've bought two cars from TLC now. They treat you like family and stand behind their vehicles. Highly recommend.",
    rating: 5,
  },
  {
    name: "David R.",
    text: "Best used car experience I've ever had. The team was upfront about everything and the truck runs great 6 months later.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.95),rgba(30,58,95,0.8))]" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Find Your Perfect Ride in{" "}
              <span className="text-secondary">North Texas</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 md:text-xl">
              Quality pre-owned vehicles at honest prices. Family-owned dealership
              serving the DFW metroplex with integrity and care.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="xl" variant="secondary">
                <Link href="/inventory">
                  Browse Inventory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/financing">Get Pre-Approved</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Why Choose {SITE_NAME}?
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re not your typical used car lot. Here&apos;s what sets us apart.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Inventory Teaser */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Check Out Our Inventory
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re always adding quality vehicles. Browse our full selection online.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Trucks & SUVs", "Sedans & Coupes", "Vans & Wagons"].map(
              (category) => (
                <Card
                  key={category}
                  className="group cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Car className="h-16 w-16 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                    <h3 className="mt-4 text-xl font-semibold">{category}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      View available vehicles
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link href="/inventory">
                View Full Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real reviews from real people in the DFW community.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Find Your Next Vehicle?
          </h2>
          <p className="mt-3 text-secondary-foreground/80">
            Visit us today or browse our inventory online. Call us at{" "}
            <a href={`tel:${CONTACT.phone}`} className="font-semibold underline">
              {CONTACT.phone}
            </a>
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="xl"
              className="bg-white text-secondary hover:bg-white/90"
            >
              <Link href="/inventory">Browse Inventory</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            {[
              "Family Owned & Operated",
              "All Vehicles Inspected",
              "Financing Available",
              "Trade-Ins Welcome",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
