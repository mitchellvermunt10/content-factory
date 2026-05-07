import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-text-subtle",
        "transition-all duration-200 ease-expo-out resize-none",
        "focus:outline-none focus:border-border-strong focus:bg-surface focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.1)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
