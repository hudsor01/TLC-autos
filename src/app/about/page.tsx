import type { Metadata } from "next";
import Link from "next/link";
import { Users, Award, Heart, Handshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME, CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about TLC Autos — a family-owned used car dealership in North Texas committed to honest deals and quality vehicles.",
};

const VALUES = [
  {
    icon: Handshake,
    title: "Honesty First",
    description:
      "No hidden fees, no bait-and-switch. We believe a fair deal builds lasting relationships.",
  },
  {
    icon: Award,
    title: "Quality Standards",
    description:
      "Every vehicle is thoroughly inspected and serviced before it earns a spot on our lot.",
  },
  {
    icon: Heart,
    title: "Customer Care",
    description:
      "We treat every customer like family. Your satisfaction doesn't end when you drive off the lot.",
  },
  {
    icon: Users,
    title: "Community Roots",
    description:
      "Proudly serving the North Texas community. We live here, work here, and give back here.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            About {SITE_NAME}
          </h1>
          <p className="mt-2 text-primary-foreground/70">
            A family-owned dealership built on trust and quality.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Our Story
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {SITE_NAME} was founded with a simple idea: buying a used car
                shouldn&apos;t be a stressful experience. Too many people dread
                walking onto a car lot because they expect pressure, hidden fees,
                and vehicles that won&apos;t last.
              </p>
              <p>
                We set out to change that. As a family-owned dealership in North
                Texas, we hand-pick every vehicle on our lot, put it through a
                comprehensive inspection, and price it fairly from the start. No
                games, no gimmicks.
              </p>
              <p>
                Whether you&apos;re a first-time buyer, a growing family looking
                for more space, or someone who needs a reliable work truck, our
                team is here to help you find the right fit — at a price that
                makes sense for your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            What We Stand For
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "500+", label: "Vehicles Sold" },
              { value: "4.9", label: "Google Rating" },
              { value: "100%", label: "Inspected Vehicles" },
              { value: "North TX", label: "Proudly Serving" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Come See Us
          </h2>
          <p className="mt-3 text-primary-foreground/70">
            We&apos;re located at {CONTACT.fullAddress}. Stop by for a
            no-pressure visit.
          </p>
          <div className="mt-6 text-sm text-primary-foreground/60">
            <p>{CONTACT.hours.weekdays}</p>
            <p>{CONTACT.hours.saturday}</p>
            <p>{CONTACT.hours.sunday}</p>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="/inventory">
                Browse Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact">Get Directions</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
