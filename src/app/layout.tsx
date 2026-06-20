import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FilterProvider } from "@/context/FilterContext";

export const metadata: Metadata = {
  title: "Moustachir Decision Intelligence Hub",
  description: "Plateforme décisionnelle d'intelligence d'affaires Moustachir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-[#F5F8FB] text-[#17345C] min-h-screen">
        <AuthProvider>
          <FilterProvider>
            {children}
          </FilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
