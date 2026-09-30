import { FC, ReactNode } from "react";
import { cn } from "./cn";

interface FieldLabelProps {
  optional?: boolean;
  children: ReactNode;
}

export const FieldLabel: FC<FieldLabelProps> = ({ optional, children }) => (
  <span className="mb-1.5 flex items-baseline gap-1.5 text-sm text-muted">
    {children}
    {optional ? (
      <span className="text-[11px] text-muted/65">optional</span>
    ) : null}
  </span>
);

interface Props {
  label: string;
  htmlFor?: string;
  className?: string;
  optional?: boolean;
  children: ReactNode;
}

const Field: FC<Props> = ({
  label,
  htmlFor,
  className,
  optional,
  children,
}) => {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      {children}
    </label>
  );
};

export default Field;
