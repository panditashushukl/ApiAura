"use client";

import React from "react";
import { useRequestDetail } from "@/features/requests/hooks/use-requests";
import { X } from "lucide-react";

interface RequestTabHeaderProps {
    requestId: string;
    isActive: boolean;
    onSelect: () => void;
    onClose: (e: React.MouseEvent) => void;
}

export function RequestTabHeader({
    requestId,
    isActive,
    onSelect,
    onClose,
}: RequestTabHeaderProps) {
    const { data: request } = useRequestDetail(requestId);

    const getMethodColor = (m?: string) => {
        switch (m) {
            case "GET":
                return "text-emerald-500 font-bold";
            case "POST":
                return "text-amber-500 font-bold";
            case "PUT":
                return "text-blue-500 font-bold";
            case "DELETE":
                return "text-red-500 font-bold";
            case "PATCH":
                return "text-purple-500 font-bold";
            default:
                return "text-zinc-500 font-bold";
        }
    };

    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-t border-t-2 text-xs font-mono cursor-pointer transition select-none ${
                isActive
                    ? "bg-[rgb(var(--card))] border-[rgb(var(--primary))] text-[rgb(var(--foreground))] font-semibold shadow-sm"
                    : "border-transparent text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]"
            }`}
        >
            <span className={`text-[10px] ${getMethodColor(request?.method)}`}>
                {request?.method || "REQ"}
            </span>
            <span className="max-w-[130px] truncate">{request?.name || "Loading..."}</span>
            <button
                type="button"
                onClick={onClose}
                className="ml-1 rounded p-0.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-red-400 transition"
                title="Close Tab"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}
