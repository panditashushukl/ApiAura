import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
    return (
        <AppShell>
            <div className="p-6">
                <h1 className="text-2xl font-semibold">
                    Overview
                </h1>

                <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                    Welcome to ApiAura.
                </p>
            </div>
        </AppShell>
    );
}