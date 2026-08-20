import { FC, ReactNode } from "react";
import { cn } from "./cn";

interface Props {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

const Field: FC<Props> = ({ label, htmlFor, className, children }) => {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
};

export default Field;
