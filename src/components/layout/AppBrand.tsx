import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface Props {
  compact?: boolean;
}

const AppBrand: FC<Props> = ({ compact = false }) => {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
    >
      <Image
        src="/logo-cropped.svg"
        alt=""
        width={20}
        height={20}
        priority
        className="h-5 w-5 shrink-0 dark:invert"
        aria-hidden
      />
      {!compact && (
        <span className="text-2xl font-semibold tracking-tight">Quillo</span>
      )}
    </Link>
  );
};

export default AppBrand;
