

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FADENFAB | Premium T-Shirt Printing",
  description:
    "Premium custom t-shirt printing in Chennai for startups, colleges & companies.",

  keywords: [
    "tshirt printing",
    "custom tshirts",
    "corporate tshirts",
    "college fest tshirts",
    "startup merchandise",
    "FADENFAB",
    "tshirt printing chennai",
  ],

  authors: [
    {
      name: "FADENFAB",
    },
  ],

  creator: "FADENFAB",

  openGraph: {
    title: "FADENFAB",
    description:
      "Premium custom t-shirt printing in Chennai.",
    url: "https://FADENFAB-website.vercel.app",
    siteName: "FADENFAB",
    locale: "en_IN",
    type: "website",
  },

  icons: {
    icon: "/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 text-slate-900 antialiased overflow-x-hidden min-h-screen">
        {children}
      </body>

    </html>
  );
}