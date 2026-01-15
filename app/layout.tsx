import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/providers/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ingestion Frontend",
  description: "Upload sprites → edit boxes → export dataset.zip",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={inter.className + " h-full"}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
