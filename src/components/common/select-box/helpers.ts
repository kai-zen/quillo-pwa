import {
  Children,
  isValidElement,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export type SelectSize = "sm" | "md";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "children"
> {
  sizeVariant?: SelectSize;
  children?: ReactNode;
}

export const triggerSizeClass: Record<SelectSize, string> = {
  sm: "min-h-8 rounded-md py-1.5 pl-2.5 pr-8 text-xs",
  md: "min-h-10 rounded-lg py-2 pl-3 pr-10 text-sm",
};

export const chevronSizeClass: Record<SelectSize, string> = {
  sm: "right-2.5 h-3.5 w-3.5",
  md: "right-3.5 h-4 w-4",
};

export const optionSizeClass: Record<SelectSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
};

export const readOptions = (children: ReactNode): SelectOption[] => {
  const options: SelectOption[] = [];

  Children.forEach(children, (child) => {
    if (
      !isValidElement<{
        value?: string | number;
        disabled?: boolean;
        children?: ReactNode;
      }>(child)
    ) {
      return;
    }

    if (child.type !== "option") return;

    options.push({
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: !!child.props.disabled,
    });
  });

  return options;
};
