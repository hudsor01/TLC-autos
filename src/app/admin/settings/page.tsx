"use client";

import { SITE_NAME, CONTACT } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Dealership Info */}
      <Card>
        <CardHeader>
          <CardTitle>Dealership Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Dealership Name</p>
              <p className="font-medium">{SITE_NAME}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{CONTACT.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{CONTACT.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{CONTACT.fullAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between max-w-sm">
              <span className="text-muted-foreground">Weekdays</span>
              <span className="font-medium">{CONTACT.hours.weekdays}</span>
            </div>
            <div className="flex justify-between max-w-sm">
              <span className="text-muted-foreground">Saturday</span>
              <span className="font-medium">{CONTACT.hours.saturday}</span>
            </div>
            <div className="flex justify-between max-w-sm">
              <span className="text-muted-foreground">Sunday</span>
              <span className="font-medium">{CONTACT.hours.sunday}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground">Sales Tax Rate (TX)</p>
            <p className="text-2xl font-bold">6.25%</p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Note */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dealership settings are configured in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              src/lib/constants.ts
            </code>
            . To update dealership information, edit that file directly and
            redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
