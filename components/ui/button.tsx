"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-300 ease-expo-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:focus-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-text text-bg hover:bg-text/90 shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_8px_24px_-12px_rgba(255,255,255,0.4)]",
        accent:
          "text-bg bg-accent hover:bg-accent/90 shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_8px_28px_-8px_hsl(var(--accent)/0.6)]",
        secondary:
          "bg-elevated text-text border border-border hover:border-border-strong hover:bg-surface",
        ghost: "text-text-muted hover:text-text hover:bg-surface",
        outline:
          "border border-border-strong bg-transparent text-text hover:bg-surface",
        link: "text-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
