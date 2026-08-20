import type { Metadata } from "next";
import "./globals.css";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Quillo PWA App",
  description: "Quillo PWA App. Personal Tasks Manager Inspired By Scrum.",
};

interface Props {
  children: ReactNode;
}

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
};

export default RootLayout;
