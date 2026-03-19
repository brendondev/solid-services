import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ToastProvider>
            <KeyboardShortcutsProvider>
              {children}
              <KeyboardShortcutsDialog />
            </KeyboardShortcutsProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
