import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

const OfflinePage: FC = () => {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={72}
        height={72}
        priority
        className="h-18 w-18 dark:invert"
        aria-hidden
      />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-sm text-muted">
          Quillo can&apos;t reach the network right now. Reconnect and try again
          to sync your tasks.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
      >
        Try again
      </Link>
    </main>
  );
};

export default OfflinePage;
