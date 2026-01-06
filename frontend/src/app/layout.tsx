import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/ui/app-shell";
import Script from 'next/script';

export const metadata = {
  title: {
    default: "PayThm | Secure Payments & Financial Freedom",
    template: "%s | PayThm"
  },
  description: "Experience the future of payments with PayThm. Instant transfers, secure wallet service, and AI-powered financial insights.",
  keywords: ["Payments", "Wallet", "UPI", "Finance", "Banking", "Secure"],
};

import { VoiceAssistant } from "@/components/ui/voice-assistant";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <AppShell>
          {children}
        </AppShell>
        <VoiceAssistant />
        <Toaster />
      </body>
    </html>
  );
}
