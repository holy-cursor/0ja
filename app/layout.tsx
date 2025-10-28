import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "0ja — The crypto street market for digital products",
  description: "Create, sell, and discover digital products. Get paid instantly in crypto — no banks, no middlemen.",
  keywords: "0ja, digital marketplace, crypto payments, digital products, creator economy, blockchain, USDC",
  authors: [{ name: "0ja Team" }],
  openGraph: {
    title: "0ja — The crypto street market for digital products",
    description: "Create, sell, and discover digital products. Get paid instantly in crypto — no banks, no middlemen.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "0ja — The crypto street market for digital products",
    description: "Create, sell, and discover digital products. Get paid instantly in crypto — no banks, no middlemen.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body className="font-sans">
          <Navigation />
          <main className="min-h-screen pb-14 md:pb-0 safe-bottom">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
