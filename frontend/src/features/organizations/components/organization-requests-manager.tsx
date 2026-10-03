"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  getOrganizationJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  MembershipRequestResponse,
} from "../api/org-membership.api";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, Building2, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

export function OrganizationRequestsManager() {
  const toast = useToast();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MembershipRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const orgId = user?.organizationId;

  const fetchRequests = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const data = await getOrganizationJoinRequests(orgId);
      setRequests(data || []);
    } catch (err: unknown) {
      console.error("Failed to fetch organization join requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchRequests();
    }
  }, [orgId]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await approveJoinRequest(id);
      toast.success("Membership request approved successfully!");
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve request";
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await rejectJoinRequest(id);
      toast.success("Membership request rejected.");
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject request";
      toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  if (!orgId) {
    return (
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 text-center text-xs text-[rgb(var(--muted-foreground))]">
        No Organization associated. Create an organization to manage join requests.
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-4 rounded-2xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--card))]/70 backdrop-blur-xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))]/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">
              Organization Join Requests
            </h3>
            <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
              Approve or reject member requests for {user?.organizationName || "your organization"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchRequests} disabled={isLoading} className="gap-1 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 text-xs text-[rgb(var(--muted-foreground))]">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading pending requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-6 text-center text-xs text-[rgb(var(--muted-foreground))]">
          No membership requests found for your organization.
        </div>
      ) : (
        <div className="divide-y divide-[rgb(var(--border))]/50">
          {requests.map((req) => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[rgb(var(--foreground))]">
                    {req.userName}
                  </span>
                  <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
                    ({req.userEmail})
                  </span>
                  <Badge
                    variant={
                      req.status === "PENDING"
                        ? "warning"
                        : req.status === "APPROVED"
                        ? "success"
                        : "danger"
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
                {req.message && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] italic">
                    "{req.message}"
                  </p>
                )}
                <div className="text-[10px] text-[rgb(var(--muted-foreground))]">
                  Requested on {new Date(req.requestedAt).toLocaleDateString()}
                </div>
              </div>

              {req.status === "PENDING" ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actionId === req.id}
                    onClick={() => handleReject(req.id)}
                    className="gap-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {actionId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionId === req.id}
                    onClick={() => handleApprove(req.id)}
                    className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {actionId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                    Approve
                  </Button>
                </div>
              ) : (
                <span className="text-[11px] text-[rgb(var(--muted-foreground))]">
                  Processed by {req.reviewedByName || "Admin"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
