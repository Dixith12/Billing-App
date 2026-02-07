import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Billing App",
  description: "Billing App powered by BigBotCo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-white text-black antialiased no-scrollbar">
        <AppProvider>
          {children}
          <Toaster
            theme="light"
            position="top-right" // optional: top-right is common & nice
            richColors // optional: nicer colors
            closeButton // optional: adds X button
            duration={3000} // optional: auto-hide after 4s
          />
        </AppProvider>
      </body>
    </html>
  );
}
