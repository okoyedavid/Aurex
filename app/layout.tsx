import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthHandoffProvider } from "@/components/auth-handoff-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aurex | Business Payments Platform",
    template: "%s | Aurex",
  },
  description:
    "Manage business payments, invoices, settlements, reconciliation, and cash flow in one secure workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-hidden">
        <QueryProvider>
          <AuthHandoffProvider>
            <NavBar />
            {children}
            <Footer />
            <Toaster />
          </AuthHandoffProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
