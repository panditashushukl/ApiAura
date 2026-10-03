"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { updateMyProfile } from "@/features/admin/users/api/user.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  ShieldCheck,
  Palette,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Laptop,
  Building2,
  Plus
} from "lucide-react";
import { CreateOrganizationDialog } from "@/features/admin/organizations/components/create-organization-dialog";
import { OrganizationJoinModal } from "@/features/organizations/components/organization-join-modal";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "execution" | "organization">("profile");
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Profile Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Execution Defaults State
  const [timeoutMs, setTimeoutMs] = useState("30000");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [sslVerify, setSslVerify] = useState(true);
  const [execMsg, setExecMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMsg(null);
    try {
      const updated = await updateMyProfile({ name, email });
      updateUser({
        name: updated.name,
        email: updated.email,
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setProfileMsg({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecutionSave = (e: React.FormEvent) => {
    e.preventDefault();
    setExecMsg("API Execution defaults saved!");
    setTimeout(() => setExecMsg(null), 2500);
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
            Preferences & Settings
          </h1>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Manage your user account profile, theme appearance, and default API execution settings.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))]/50 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] border border-[rgb(var(--primary))]/30 shadow-xs"
                : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile & Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "appearance"
                ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] border border-[rgb(var(--primary))]/30 shadow-xs"
                : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Appearance & Glass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("execution")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "execution"
                ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] border border-[rgb(var(--primary))]/30 shadow-xs"
                : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>API Execution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("organization")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "organization"
                ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] border border-[rgb(var(--primary))]/30 shadow-xs"
                : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Organization & Team</span>
          </button>
        </div>

        {/* Tab 1: Profile & Self-CRUD */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/70 p-6 shadow-md backdrop-blur-xl space-y-6 glass-card">
              <div className="flex items-center gap-4 border-b border-[rgb(var(--border))]/50 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[rgb(var(--primary))] to-indigo-500 text-white font-bold text-xl shadow-lg">
                  {userInitial}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[rgb(var(--foreground))]">{user?.name || "User Profile"}</h2>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                {profileMsg && (
                  <div
                    className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                      profileMsg.type === "success"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {profileMsg.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-xs font-semibold">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                    <Input
                      id="settings-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="settings-email" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                    <Input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--secondary))]/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[rgb(var(--foreground))]">
                    <ShieldCheck className="h-4 w-4 text-[rgb(var(--primary))]" />
                    <span>User Roles & Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.roles?.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-[rgb(var(--primary))]/10 px-3 py-1 text-[10px] font-bold text-[rgb(var(--primary))]"
                      >
                        {role}
                      </span>
                    )) || (
                      <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-[10px] font-bold text-zinc-500">
                        DEVELOPER
                      </span>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Profile Changes
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Appearance & Glassmorphism */}
        {activeTab === "appearance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/70 p-6 shadow-md backdrop-blur-xl space-y-6 glass-card">
              <div>
                <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">Theme Mode</h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                  Select your preferred color scheme for ApiAura interface.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    theme === "dark-blue"
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 shadow-sm"
                      : "border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--secondary))]"
                  }`}
                >
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[rgb(var(--foreground))]">Dark Blue</p>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))]">Glassmorphic Dark Theme</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    theme === "light-blue"
                      ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10 shadow-sm"
                      : "border-[rgb(var(--border))]/60 hover:bg-[rgb(var(--secondary))]"
                  }`}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[rgb(var(--foreground))]">Light Glass</p>
                    <p className="text-[10px] text-[rgb(var(--muted-foreground))]">Clean High Contrast Theme</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: API Execution */}
        {activeTab === "execution" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleExecutionSave} className="rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/70 p-6 shadow-md backdrop-blur-xl space-y-6 glass-card max-w-lg">
              {execMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{execMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="timeout" className="text-xs font-semibold">
                  Default Request Timeout (ms)
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--border))]/50">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--foreground))]">Follow HTTP Redirects</p>
                  <p className="text-[10px] text-[rgb(var(--muted-foreground))]">Automatically follow 3xx redirect responses</p>
                </div>
                <input
                  type="checkbox"
                  checked={followRedirects}
                  onChange={(e) => setFollowRedirects(e.target.checked)}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--border))]/50">
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--foreground))]">SSL Verification</p>
                  <p className="text-[10px] text-[rgb(var(--muted-foreground))]">Verify SSL certificates for HTTPS endpoints</p>
                </div>
                <input
                  type="checkbox"
                  checked={sslVerify}
                  onChange={(e) => setSslVerify(e.target.checked)}
                  className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
                />
              </div>

              <Button type="submit" size="sm">
                Save Execution Defaults
              </Button>
            </form>
          </div>
        )}

        {/* Tab 4: Organization & Teams */}
        {activeTab === "organization" && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
            <div className="rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/70 p-6 shadow-md backdrop-blur-xl space-y-5 glass-card">
              <div>
                <h3 className="text-base font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  <span>Organization & Team Management</span>
                </h3>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Create an organization to become an Admin or request to join an existing company team.
                </p>
              </div>

              {/* Current Status Card */}
              <div className="rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--secondary))]/30 p-4 space-y-2">
                <span className="text-[11px] font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                  Current Status
                </span>
                {user?.organizationName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[rgb(var(--foreground))]">
                        {user.organizationName}
                      </p>
                      <p className="text-xs text-indigo-500 font-semibold mt-0.5">
                        Role: {user.roles?.[0] || "ADMIN"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                      Active Member
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[rgb(var(--foreground))]">
                      No Organization Joined Yet
                    </p>
                    <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
                      You are currently operating as a Guest. Create an organization to become an Admin, or request to join a team below.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <CreateOrganizationDialog />
                <Button
                  variant="secondary"
                  onClick={() => setJoinModalOpen(true)}
                  className="gap-2 text-xs font-semibold"
                >
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Join Existing Organization
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <OrganizationJoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </AppShell>
  );
}
