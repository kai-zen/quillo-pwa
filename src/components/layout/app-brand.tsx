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
        src="/logo.svg"
        alt=""
        width={28}
        height={28}
        priority
        className="h-7 w-7 shrink-0"
        aria-hidden
      />
      {!compact && (
        <span className="text-xl font-semibold tracking-tight">Quillo</span>
      )}
    </Link>
  );
};

export default AppBrand;
