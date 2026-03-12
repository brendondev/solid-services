import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solid Service - ERP SaaS",
  description: "Sistema de gestão para prestadores de serviços",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
