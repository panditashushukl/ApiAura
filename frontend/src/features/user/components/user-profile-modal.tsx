"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { changeMyPassword, updateMyProfile } from "@/features/admin/users/api/user.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Mail, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Phone, Building2, KeyRound, Lock, ChevronDown } from "lucide-react";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { user, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || "");

    // Password state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setMobileNumber(user.mobileNumber || "");
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            // If password change is requested
            if (showPasswordSection && newPassword) {
                if (newPassword !== confirmNewPassword) {
                    throw new Error("New passwords do not match.");
                }
                if (!currentPassword) {
                    throw new Error("Current password is required.");
                }
                await changeMyPassword({ currentPassword, newPassword });
            }

            const updatedUser = await updateMyProfile({ name, email, mobileNumber });
            updateUser({
                name: updatedUser.name,
                email: updatedUser.email,
                mobileNumber: updatedUser.mobileNumber,
            });
            setMessage({ type: "success", text: "Profile & settings updated successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsSaving(false);
        }
    };

    const userInitial = name ? name.charAt(0).toUpperCase() : "U";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/90 backdrop-blur-xl p-6 shadow-2xl glass-dropdown max-h-[90vh] overflow-y-auto scrollbar-thin">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[rgb(var(--border))]/50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[rgb(var(--primary))] to-indigo-500 text-white font-bold shadow-md">
                            {userInitial}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[rgb(var(--foreground))]">Account Profile</h3>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Update your personal details & preferences</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))] transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {message && (
                        <div
                            className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                                message.type === "success"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="profile-name" className="text-xs font-semibold">
                            Full Name
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                            <Input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="pl-9 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="profile-email" className="text-xs font-semibold">
                            Email Address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                            <Input
                                id="profile-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                                className="pl-9 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="profile-mobile" className="text-xs font-semibold flex items-center justify-between">
                            <span>Mobile Number</span>
                            <span className="text-[10px] text-[rgb(var(--muted-foreground))] font-normal">Optional</span>
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                            <Input
                                id="profile-mobile"
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="pl-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Change Password Collapsible Section */}
                    <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--secondary))]/20 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="flex items-center justify-between w-full p-3 text-xs font-semibold text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]/40 transition"
                        >
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-amber-500" />
                                <span>Change Security Password</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showPasswordSection ? "rotate-180" : ""}`} />
                        </button>

                        {showPasswordSection && (
                            <div className="p-3 pt-1 border-t border-[rgb(var(--border))]/40 space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="curr-pass" className="text-[11px] font-medium text-[rgb(var(--muted-foreground))]">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                                        <Input
                                            id="curr-pass"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="new-pass" className="text-[11px] font-medium text-[rgb(var(--muted-foreground))]">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                                        <Input
                                            id="new-pass"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            className="pl-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="conf-new-pass" className="text-[11px] font-medium text-[rgb(var(--muted-foreground))]">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                                        <Input
                                            id="conf-new-pass"
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Repeat new password"
                                            className="pl-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Organization & Roles Tag */}
                    <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--secondary))]/30 p-3 space-y-2">
                        {user?.organizationName && (
                            <div className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--foreground))]">
                                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Organization: <strong className="text-[rgb(var(--primary))]">{user.organizationName}</strong></span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--muted-foreground))]">
                            <ShieldCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                            <span>Assigned Roles:</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {user?.roles?.map((role) => (
                                    <span
                                        key={role}
                                        className="rounded-full bg-[rgb(var(--primary))]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--primary))]"
                                    >
                                        {role}
                                    </span>
                                )) || (
                                    <span className="rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                                        GUEST
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgb(var(--border))]/50">
                        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
                            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
