import {
  FC,
  HTMLAttributes,
  KeyboardEvent,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "./cn";

const Table: FC<HTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="min-w-0 w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-sm shadow-black/2">
    <table
      className={cn(
        "w-full min-w-xl border-collapse text-left text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </table>
  </div>
);

const TableHeader: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={cn("border-b border-border bg-accent-surface", className)}
    {...props}
  >
    {children}
  </thead>
);

const TableBody: FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody
    className={cn(
      "[&>tr:nth-child(odd)]:bg-accent-soft/55 [&>tr:nth-child(even)]:bg-surface",
      className,
    )}
    {...props}
  >
    {children}
  </tbody>
);

interface TableRowProps extends Omit<
  HTMLAttributes<HTMLTableRowElement>,
  "onClick"
> {
  onClick?: () => void;
}

const TableRow: FC<TableRowProps> = ({
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-border last:border-b-0 transition-colors",
        onClick &&
          "cursor-pointer hover:bg-foreground/4 focus-visible:bg-foreground/4 focus-visible:outline-none",
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead: FC<ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={cn(
      "px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted",
      className,
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell: FC<TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td
    className={cn("px-3 py-2.5 align-middle text-foreground", className)}
    {...props}
  >
    {children}
  </td>
);

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
export default Table;
