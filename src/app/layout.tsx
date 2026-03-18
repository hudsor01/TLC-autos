import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Quality Pre-Owned Vehicles in North Texas`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "used cars",
    "pre-owned vehicles",
    "North Texas",
    "Dallas",
    "car dealership",
    "buy here pay here",
    "auto financing",
    "TLC Autos",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="bottom-right" closeButton richColors />
      </body>
    </html>
  );
}
