import type { Metadata } from "next";
import Header from "@/components/header";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Análisis ODS",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" title="Análisis ODS - Opiniones">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative h-screen `}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
