import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "سفراء الأمن الرقمي",
  description:
    "استبيان حول استخدام الإنترنت ومخاطره، والتنمر الإلكتروني، وأخلاقيات المواطن الرقمي والاستخدام الآمن والمسؤول للتقنية.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
