import * as React from "react";

export function Card({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`
                rounded-xl
                border
                border-[rgb(var(--border))]
                bg-[rgb(var(--card))]
                text-[rgb(var(--card-foreground))]
                shadow-sm
                ${className}
            `}
            {...props}
        />
    );
}

export function CardHeader({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`p-5 pb-3 ${className}`}
            {...props}
        />
    );
}

export function CardTitle({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={`font-semibold ${className}`}
            {...props}
        />
    );
}

export function CardDescription({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={`
                mt-1
                text-sm
                text-[rgb(var(--muted-foreground))]
                ${className}
            `}
            {...props}
        />
    );
}

export function CardContent({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`p-5 pt-2 ${className}`}
            {...props}
        />
    );
}

export function CardFooter({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`p-5 pt-0 ${className}`}
            {...props}
        />
    );
}