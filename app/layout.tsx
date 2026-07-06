import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { themeInitScript } from "@/lib/theme";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Macro Signal",
  description:
    "Compare World Bank macro indicators across major economies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
