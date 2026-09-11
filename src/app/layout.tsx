import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { FC, ReactNode } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { InstallPrompt, SerwistProvider } from "@/components/pwa";
import Providers from "@/components/providers";
import {
  THEME_BLOCKING_SCRIPT,
  THEME_COLORS,
} from "@/components/theme/helpers";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const APP_NAME = "Quillo";
const APP_DESCRIPTION = "Personal tasks manager inspired by Scrum.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  generator: "Next.js",
  keywords: ["tasks", "scrum", "productivity", "pwa", "quillo"],
  authors: [{ name: "Quillo" }],
  creator: "Quillo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

interface Props {
  children: ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BLOCKING_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation
          reloadOnOnline
        >
          <Providers>
            <AuthGuard>{children}</AuthGuard>
            <InstallPrompt />
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
};

export default RootLayout;
