

import type { Metadata } from "next";
import "./globals.css";

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

      <body className="bg-black text-white antialiased overflow-x-hidden">

        {/* Main App */}
        {children}

      </body>

    </html>
  );
}