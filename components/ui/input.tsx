import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm text-text placeholder:text-text-subtle",
        "transition-all duration-200 ease-expo-out",
        "focus:outline-none focus:border-border-strong focus:bg-surface focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.1)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
