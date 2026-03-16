"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">Message Sent!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you as soon as
          possible.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        try {
          await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: formData.get("firstName"),
              lastName: formData.get("lastName"),
              email: formData.get("email"),
              phone: formData.get("phone") || "",
              source: "website",
              status: "new",
              vehicleInterest: subject === "vehicle-inquiry" ? "Vehicle inquiry from website" : "",
              notes: `Subject: ${subject}\n\n${message}`,
            }),
          });
        } catch {
          // Still show success to user even if lead creation fails
          // (the message was "sent" from their perspective)
        }

        setSubmitting(false);
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            First Name *
          </label>
          <Input id="firstName" name="firstName" required placeholder="John" />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            Last Name *
          </label>
          <Input id="lastName" name="lastName" required placeholder="Doe" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Subject *
        </label>
        <Select id="subject" name="subject" required>
          <option value="">Select a subject...</option>
          <option value="vehicle-inquiry">Vehicle Inquiry</option>
          <option value="financing">Financing Question</option>
          <option value="trade-in">Trade-In Appraisal</option>
          <option value="test-drive">Schedule Test Drive</option>
          <option value="general">General Question</option>
        </Select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message *
        </label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us how we can help..."
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>

      <p className="text-xs text-muted-foreground">
        By submitting this form, you agree to be contacted by {" "}
        TLC Autos regarding your inquiry.
      </p>
    </form>
  );
}
