import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  CheckCircle,
  ArrowRight,
  FileText,
  Clock,
  Shield,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Flexible auto financing for all credit types at TLC Autos. Get pre-approved today and drive home in your next vehicle.",
};

const STEPS = [
  {
    icon: FileText,
    step: "1",
    title: "Apply",
    description:
      "Fill out a quick application online or in person. It only takes a few minutes.",
  },
  {
    icon: Clock,
    step: "2",
    title: "Get Approved",
    description:
      "We work with multiple lenders to find the best rate and terms for your situation.",
  },
  {
    icon: Shield,
    step: "3",
    title: "Choose Your Vehicle",
    description:
      "Browse our inventory knowing exactly what you can afford. No surprises.",
  },
  {
    icon: DollarSign,
    step: "4",
    title: "Drive Home",
    description:
      "Sign your paperwork and drive off the lot in your new ride — often the same day!",
  },
];

const BENEFITS = [
  "All credit types welcome — good, bad, or no credit",
  "Competitive interest rates from multiple lenders",
  "Flexible down payment options",
  "Quick approval — often within hours",
  "No obligation to buy with pre-approval",
  "Experienced finance team to guide you",
  "Trade-in value applied to your down payment",
  "Transparent terms — no hidden fees",
];

export default function FinancingPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Auto Financing
          </h1>
          <p className="mt-2 text-primary-foreground/70">
            Flexible financing solutions to fit your budget. All credit types
            welcome.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Getting financed at {SITE_NAME} is simple and hassle-free.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Card key={step.step} className="relative text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {step.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Why Finance With Us?
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Credit Situations */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            We Work With All Credit Situations
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Good Credit",
                description:
                  "Enjoy the best rates from our lending partners. Your good credit deserves great terms.",
              },
              {
                title: "Rebuilding Credit",
                description:
                  "Had some bumps in the road? We specialize in helping customers rebuild their credit with manageable payments.",
              },
              {
                title: "First-Time Buyers",
                description:
                  "No credit history? No problem. We have programs specifically designed for first-time auto buyers.",
              },
            ].map((situation) => (
              <Card key={situation.title}>
                <CardHeader>
                  <CardTitle className="text-center">{situation.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">
                    {situation.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-3 text-secondary-foreground/80">
            Contact us today to discuss your financing options. Our team is ready
            to help you get behind the wheel.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="xl"
              className="bg-white text-secondary hover:bg-white/90"
            >
              <a href={`tel:${CONTACT.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call {CONTACT.phone}
              </a>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <Link href="/inventory">
                Browse Inventory
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
