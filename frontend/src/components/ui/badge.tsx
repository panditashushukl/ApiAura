import { ReactNode } from "react";

type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
    title?: string;
}

const variants: Record<BadgeVariant, string> = {
    default: `
        bg-[rgb(var(--secondary))]
        text-[rgb(var(--secondary-foreground))]
    `,

    success: `
        bg-[rgb(var(--success))]/15
        text-[rgb(var(--success))]
    `,

    warning: `
        bg-[rgb(var(--warning))]/15
        text-[rgb(var(--warning))]
    `,

    danger: `
        bg-[rgb(var(--danger))]/15
        text-[rgb(var(--danger))]
    `,

    info: `
        bg-[rgb(var(--info))]/15
        text-[rgb(var(--info))]
    `,
};

export function Badge({
    children,
    variant = "default",
    className = "",
    title,
}: BadgeProps) {
    return (
        <span
            title={title}
            className={`
                inline-flex
                items-center
                rounded-md
                px-2
                py-0.5
                text-xs
                font-medium
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}