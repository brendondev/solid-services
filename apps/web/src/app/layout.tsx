import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts";
import { PWAWrapper } from "@/components/pwa/pwa-wrapper";

export const metadata: Metadata = {
  title: "Solid Service - ERP SaaS",
  description: "Sistema de gestão para prestadores de serviços",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Solid Service",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Solid Service" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ToastProvider>
            <KeyboardShortcutsProvider>
              <PWAWrapper />
              {children}
              <KeyboardShortcutsDialog />
            </KeyboardShortcutsProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
