import * as React from "react";

interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({
    className = "",
    error = false,
    ...props
}: InputProps) {
    return (
        <input
            className={`
                flex
                h-9
                w-full
                rounded-lg
                border
                bg-[rgb(var(--background))]
                px-3
                text-sm
                text-[rgb(var(--foreground))]
                outline-none
                transition

                placeholder:text-[rgb(var(--muted-foreground))]

                ${
                    error
                        ? `
                            border-[rgb(var(--danger))]
                            focus:ring-[rgb(var(--danger))]/20
                          `
                        : `
                            border-[rgb(var(--input))]
                            focus:border-[rgb(var(--ring))]
                            focus:ring-2
                            focus:ring-[rgb(var(--ring))]/20
                          `
                }

                disabled:cursor-not-allowed
                disabled:opacity-50

                ${className}
            `}
            {...props}
        />
    );
}