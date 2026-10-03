"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api/client";
import {
  createJoinRequest,
  getMyJoinRequests,
  MembershipRequestResponse,
} from "../api/org-membership.api";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Building2,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
}

interface OrganizationJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizationJoinModal({
  isOpen,
  onClose,
}: OrganizationJoinModalProps) {
  const toast = useToast();
  const { user } = useAuthStore();
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [myRequests, setMyRequests] = useState<MembershipRequestResponse[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orgRes, reqRes] = await Promise.all([
        apiClient<{ data: OrganizationItem[] }>("/organizations"),
        getMyJoinRequests(),
      ]);
      setOrganizations(orgRes.data || []);
      setMyRequests(reqRes || []);
    } catch (err: unknown) {
      console.error("Failed to load organization data", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) {
      toast.error("Please select an organization to join");
      return;
    }

    setIsSubmitting(true);
    try {
      await createJoinRequest(selectedOrgId, message);
      toast.success(
        "Join request submitted successfully",
        "The Organization Admin will review your request."
      );
      setSelectedOrgId("");
      setMessage("");
      fetchData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to submit join request";
      toast.error(errorMsg, "Request Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-2xl text-[rgb(var(--card-foreground))] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[rgb(var(--foreground))]">
                Join an Organization
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Request membership to work with existing teams
              </p>
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

        {/* Existing Join Requests Status list */}
        {myRequests.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
              Your Join Requests
            </Label>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/40 p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-[rgb(var(--primary))]" />
                    <div>
                      <span className="font-semibold text-[rgb(var(--foreground))]">
                        {req.organizationName}
                      </span>
                      {req.message && (
                        <p className="text-[11px] text-[rgb(var(--muted-foreground))] line-clamp-1">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {req.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="h-3 w-3 animate-spin" /> Pending
                      </span>
                    )}
                    {req.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400 border border-red-500/20">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit New Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-org-join" className="text-xs font-semibold text-[rgb(var(--foreground))]">
              Select Organization to Join
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-3 text-xs text-[rgb(var(--muted-foreground))]">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading organizations...
              </div>
            ) : organizations.length === 0 ? (
              <div className="p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/40 text-center text-xs text-[rgb(var(--muted-foreground))]">
                No organizations found available to join.
              </div>
            ) : (
              <select
                id="select-org-join"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full h-10 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-xs text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
              >
                <option value="">-- Choose an Organization --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} className="bg-[rgb(var(--card))] text-[rgb(var(--foreground))]">
                    {org.name} ({org.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req-message" className="text-xs font-semibold text-[rgb(var(--foreground))]">
              Message to Organization Admin (Optional)
            </Label>
            <Input
              id="req-message"
              type="text"
              placeholder="Hi, I'd like to join the team for API development..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgb(var(--border))]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedOrgId}
              className="gap-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
