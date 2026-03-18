"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const contactFormSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Enter a valid email address" }),
  phone: z.string().optional(),
  subject: z.string().min(1, { error: "Please select a subject" }),
  message: z.string().min(10, { error: "Message must be at least 10 characters" }),
});

type FormErrors = Partial<Record<keyof z.infer<typeof contactFormSchema>, string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validateField(name: keyof FormErrors, value: string) {
    const fieldSchema = contactFormSchema.shape[name];
    const result = fieldSchema.safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

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
          onClick={() => {
            setSubmitted(false);
            setErrors({});
          }}
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
        const formData = new FormData(e.currentTarget);

        const formValues = {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          subject: formData.get("subject") as string,
          message: formData.get("message") as string,
        };

        const result = contactFormSchema.safeParse(formValues);

        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors;
          const newErrors: FormErrors = {};
          for (const [key, messages] of Object.entries(fieldErrors)) {
            if (messages && messages.length > 0) {
              newErrors[key as keyof FormErrors] = messages[0];
            }
          }
          setErrors(newErrors);
          return;
        }

        setSubmitting(true);

        toast.promise(
          fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              email: formValues.email,
              phone: formValues.phone || "",
              source: "website",
              status: "new",
              vehicleInterest:
                formValues.subject === "vehicle-inquiry"
                  ? "Vehicle inquiry from website"
                  : "",
              notes: `Subject: ${formValues.subject}\n\n${formValues.message}`,
            }),
          }).then((res) => {
            if (!res.ok) throw new Error("Failed to submit");
            setSubmitted(true);
          }),
          {
            loading: "Sending your message...",
            success: "Message sent successfully!",
            error: "Failed to send message. Please try again.",
          }
        );

        setSubmitting(false);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            First Name *
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            aria-invalid={!!errors.firstName}
            className={cn(errors.firstName && "border-destructive")}
            onBlur={(e) => validateField("firstName", e.target.value)}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            Last Name *
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            aria-invalid={!!errors.lastName}
            className={cn(errors.lastName && "border-destructive")}
            onBlur={(e) => validateField("lastName", e.target.value)}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
          )}
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
          placeholder="john@example.com"
          aria-invalid={!!errors.email}
          className={cn(errors.email && "border-destructive")}
          onBlur={(e) => validateField("email", e.target.value)}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email}</p>
        )}
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
        <Select
          id="subject"
          name="subject"
          aria-invalid={!!errors.subject}
          className={cn(errors.subject && "border-destructive")}
          onBlur={(e) => validateField("subject", e.target.value)}
        >
          <option value="">Select a subject...</option>
          <option value="vehicle-inquiry">Vehicle Inquiry</option>
          <option value="financing">Financing Question</option>
          <option value="trade-in">Trade-In Appraisal</option>
          <option value="test-drive">Schedule Test Drive</option>
          <option value="general">General Question</option>
        </Select>
        {errors.subject && (
          <p className="mt-1 text-sm text-destructive">{errors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message *
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us how we can help..."
          aria-invalid={!!errors.message}
          className={cn(errors.message && "border-destructive")}
          onBlur={(e) => validateField("message", e.target.value)}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-destructive">{errors.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>

      <p className="text-xs text-muted-foreground">
        By submitting this form, you agree to be contacted by{" "}
        TLC Autos regarding your inquiry.
      </p>
    </form>
  );
}
