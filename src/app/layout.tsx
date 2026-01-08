import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Greenly - Community Carbon Footprint Tracker",
  description: "Empower your community to collaboratively monitor, manage, and reduce carbon footprint through shared goals and challenges",
};

import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/Providers";

import { MainLayout } from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
