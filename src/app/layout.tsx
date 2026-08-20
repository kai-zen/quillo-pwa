import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { FC, ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
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

const themeScript = `(function(){try{var t=localStorage.getItem("quillo_theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})();`;

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
