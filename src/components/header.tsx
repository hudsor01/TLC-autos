"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, CONTACT, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
          <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 hover:underline">
            <Phone className="h-3.5 w-3.5" />
            {CONTACT.phone}
          </a>
          <span className="hidden sm:inline">{CONTACT.hours.weekdays}</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold tracking-tight text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" variant="secondary" className="ml-2">
              <Link href="/inventory">Browse Inventory</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="border-t border-border md:hidden">
            <div className="container mx-auto space-y-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
