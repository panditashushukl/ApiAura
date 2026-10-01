import * as React from "react";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "ghost"
    | "danger";

type ButtonSize =
    | "sm"
    | "md"
    | "lg"
    | "icon";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
    primary: `
        bg-[rgb(var(--primary))]
        text-[rgb(var(--primary-foreground))]
        hover:opacity-90
    `,

    secondary: `
        border
        border-[rgb(var(--border))]
        bg-[rgb(var(--secondary))]
        text-[rgb(var(--secondary-foreground))]
        hover:bg-[rgb(var(--accent))]
    `,

    ghost: `
        text-[rgb(var(--foreground))]
        hover:bg-[rgb(var(--secondary))]
    `,

    danger: `
        bg-[rgb(var(--danger))]
        text-white
        hover:opacity-90
    `,
};

const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
    icon: "h-9 w-9",
};

export function Button({
    className = "",
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                font-medium
                outline-none
                transition
                focus-visible:ring-2
                focus-visible:ring-[rgb(var(--ring))]
                disabled:pointer-events-none
                disabled:opacity-50
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        />
    );
}