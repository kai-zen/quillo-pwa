import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { FC, ReactNode } from "react";
import AppShell from "@/components/layout/app-shell";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quillo",
  description: "Personal tasks manager inspired by Scrum.",
};

interface Props {
  children: ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
