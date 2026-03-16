import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, CONTACT } from "@/lib/constants";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_NAME}. Visit our North Texas dealership, call us, or send us a message.`,
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 text-primary-foreground/70">
            We&apos;d love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Get In Touch</h2>
                <p className="mt-2 text-muted-foreground">
                  Whether you have a question about a vehicle, need financing
                  help, or just want to say hello — we&apos;re here for you.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Phone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`tel:${CONTACT.phone}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {CONTACT.phone}
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {CONTACT.email}
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {CONTACT.fullAddress}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{CONTACT.hours.weekdays}</p>
                      <p>{CONTACT.hours.saturday}</p>
                      <p>{CONTACT.hours.sunday}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map Embed Placeholder */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {/*
                    Replace this with a Google Maps embed for your actual location:
                    <iframe
                      src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  */}
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30" />
                      <p className="mt-2 text-sm">
                        {CONTACT.fullAddress}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
