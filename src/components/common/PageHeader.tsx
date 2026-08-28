import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { cn } from "./cn";

interface Props {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  eyebrow?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const PageHeader: FC<Props> = ({
  title,
  description,
  icon: Icon,
  eyebrow,
  back,
  actions,
  children,
  className,
}) => {
  const alignStart = Boolean(eyebrow || children);

  return (
    <header className={cn("flex flex-col gap-3 pb-4", className)}>
      {back ? (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {back.label}
        </Link>
      ) : null}

      <div
        className={cn(
          "flex items-start justify-between gap-3 sm:gap-4",
          !alignStart && "sm:items-center",
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          {Icon ? (
            <div
              className="mt-0.5 flex w-8 h-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-foreground"
              aria-hidden
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2} />
            </div>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                {eyebrow}
              </div>
            ) : null}
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 lg:mt-1.5 max-w-xl text-xs lg:text-sm leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-2 max-w-2xl">{children}</div> : null}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-0.5">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default PageHeader;
