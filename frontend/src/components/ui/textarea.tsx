import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className = "", error = false, ...props }: TextareaProps) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-lg border bg-[rgb(var(--background))] px-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none transition placeholder:text-[rgb(var(--muted-foreground))] disabled:cursor-not-allowed disabled:opacity-50 ${
        error
          ? "border-[rgb(var(--danger))] focus:ring-2 focus:ring-[rgb(var(--danger))]/20"
          : "border-[rgb(var(--input))] focus:border-[rgb(var(--ring))] focus:ring-2 focus:ring-[rgb(var(--ring))]/20"
      } ${className}`}
      {...props}
    />
  );
}
