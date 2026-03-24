import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Skool Manager",
  description: "نظام إدارة المدارس الخصوصية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-cairo), sans-serif" }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}