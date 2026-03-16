import Link from "next/link";
import { Car, Phone, Mail, MapPin } from "lucide-react";
import { SITE_NAME, CONTACT, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="text-lg font-bold">{SITE_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Your trusted source for quality pre-owned vehicles in North Texas.
              Family-owned and customer-focused since day one.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${CONTACT.phone}`} className="hover:text-primary-foreground">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-primary-foreground">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{CONTACT.fullAddress}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Business Hours
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>{CONTACT.hours.weekdays}</li>
              <li>{CONTACT.hours.saturday}</li>
              <li>{CONTACT.hours.sunday}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
