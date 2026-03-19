import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Toaster } from "sonner";
import "./globals.css";

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1"><Providers>{children}</Providers></main>
          <Footer />
        </div>
        <Toaster position="bottom-right" closeButton richColors />
      </body>
    </html>
  );
}
