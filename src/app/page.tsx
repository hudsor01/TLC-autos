import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Shield,
  DollarSign,
  ThumbsUp,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Clock,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, CONTACT } from "@/lib/constants";

const STATS = [
  { value: "500+", label: "Vehicles Sold", icon: Car },
  { value: "15+", label: "Years in Business", icon: Clock },
  { value: "4.9", label: "Google Rating", icon: Star },
  { value: "98%", label: "Happy Customers", icon: Users },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Quality Inspected",
    description:
      "Every vehicle undergoes a thorough multi-point inspection before hitting our lot.",
    iconBg: "bg-blue-500/10 text-blue-400",
    border: "border-l-blue-500",
  },
  {
    icon: DollarSign,
    title: "Affordable Financing",
    description:
      "Flexible financing options for every budget. We work with all credit types.",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    border: "border-l-emerald-500",
  },
  {
    icon: ThumbsUp,
    title: "No Pressure Sales",
    description:
      "Our friendly team is here to help — not push. Take your time finding the right ride.",
    iconBg: "bg-amber-500/10 text-amber-400",
    border: "border-l-amber-500",
  },
  {
    icon: Award,
    title: "Wide Selection",
    description:
      "Trucks, SUVs, sedans, and more. We keep a diverse inventory to match your needs.",
    iconBg: "bg-rose-500/10 text-rose-400",
    border: "border-l-rose-500",
  },
];

const TESTIMONIALS = [
  {
    name: "Marcus J.",
    location: "Fort Worth, TX",
    text: "TLC Autos made buying my first truck so easy. Fair price, no games, and they helped me get financed the same day!",
    rating: 5,
  },
  {
    name: "Sarah T.",
    location: "Arlington, TX",
    text: "I've bought two cars from TLC now. They treat you like family and stand behind their vehicles. Highly recommend.",
    rating: 5,
  },
  {
    name: "David R.",
    location: "Dallas, TX",
    text: "Best used car experience I've ever had. The team was upfront about everything and the truck runs great 6 months later.",
    rating: 5,
  },
];

const CATEGORIES = [
  { name: "Trucks & SUVs", desc: "Built tough for Texas roads", count: "40+" },
  { name: "Sedans & Coupes", desc: "Reliable daily drivers", count: "30+" },
  { name: "Vans & Wagons", desc: "Room for the whole crew", count: "15+" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-muted">
        <div className="container relative mx-auto px-4 pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-36 lg:pb-44">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <p className="text-caption mb-5 text-secondary tracking-[0.2em]">
                Family-Owned Dealership in North Texas
              </p>
              <h1 className="text-display">
                Find Your Perfect{" "}
                <br className="hidden sm:block" />
                Ride in <span className="text-secondary">North Texas</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Quality pre-owned vehicles at honest prices. Serving the DFW
                metroplex with integrity and care.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="group bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/90"
                >
                  <Link href="/inventory">
                    Browse Inventory
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="border-border bg-card text-foreground hover:bg-muted"
                >
                  <Link href="/financing">Get Pre-Approved</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-black/10">
                <Image
                  src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=85&auto=format&fit=crop"
                  alt="Premium pre-owned vehicle on a dealership lot"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 0vw"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card px-5 py-3 shadow-lg">
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  New Arrivals Weekly
                </p>
                <p className="text-xs text-muted-foreground">Fresh inventory added every week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-border/50 bg-background/60">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 px-4 py-5 md:px-6 md:py-6 ${
                    i > 0 ? "border-l border-border/50" : ""
                  }`}
                >
                  <stat.icon className="h-5 w-5 shrink-0 text-secondary opacity-80" />
                  <div>
                    <p
                      className="text-xl font-bold tracking-tight text-foreground md:text-2xl"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-caption text-secondary">Why Choose Us</p>
            <h2 className="text-headline mt-3">
              Not Your Typical Used Car Lot
            </h2>
            <p className="mt-4 text-muted-foreground text-body-lg">
              Here&apos;s what sets {SITE_NAME} apart from the rest.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-xl border border-border border-l-[3px] ${feature.border} bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.iconBg}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3
                  className="mt-4 text-lg font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Inventory Teaser ── */}
      <section className="relative overflow-hidden bg-muted py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-caption text-secondary">Our Inventory</p>
            <h2 className="text-headline mt-3">Check Out Our Selection</h2>
            <p className="mt-4 text-muted-foreground text-body-lg">
              We&apos;re always adding quality vehicles. Browse our full selection
              online.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href="/inventory"
                className="group relative flex flex-col items-center rounded-xl border border-border bg-card p-10 text-center transition-all duration-300 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 hover:-translate-y-0.5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 transition-colors group-hover:bg-secondary/15">
                  <Car className="h-8 w-8 text-secondary transition-transform group-hover:scale-110" />
                </div>
                <h3
                  className="mt-5 text-xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {category.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {category.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  {category.count} Available
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="group">
              <Link href="/inventory">
                View Full Inventory
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-caption text-secondary">Testimonials</p>
            <h2 className="text-headline mt-3">What Our Customers Say</h2>
            <p className="mt-4 text-muted-foreground text-body-lg">
              Real reviews from real people in the DFW community.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-secondary/10" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-muted py-20 md:py-24">
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-headline">
            Ready to Find Your Next Vehicle?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground text-body-lg">
            Visit us today or browse our inventory online. Call us at{" "}
            <a
              href={`tel:${CONTACT.phone}`}
              className="font-semibold text-foreground underline decoration-secondary underline-offset-4"
            >
              {CONTACT.phone}
            </a>
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="xl"
              className="group bg-secondary text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/90"
            >
              <Link href="/inventory">
                Browse Inventory
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-border bg-card text-foreground hover:bg-muted"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "Family Owned & Operated",
              "All Vehicles Inspected",
              "Financing Available",
              "Trade-Ins Welcome",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
