"use client";

import Link from "next/link";
import { ArrowLeft, Edit, Shield, Calendar, Mail, Clock, UserCheck, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { useUser } from "../hooks/use-user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditUserDialog } from "./edit-user-dialog";
import { UserStatusDialog } from "./user-status-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Can } from "@/features/auth/components/can";
import { UserStatus } from "../types/user.types";

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {
  const { data: user, isLoading, isError, error, refetch } = useUser(userId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<UserStatus | null>(null);

  if (isLoading) return <LoadingState message="Loading user details..." />;
  if (isError || !user) return <ErrorState message={error instanceof Error ? error.message : "User not found."} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user.name || user.email}</h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">ID: {user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="USER_UPDATE">
            <Button variant="secondary" className="gap-2" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>

            {user.status !== "ACTIVE" ? (
              <Button className="gap-2" onClick={() => setStatusTarget("ACTIVE")}>
                <UserCheck className="h-4 w-4" />
                Activate
              </Button>
            ) : (
              <Button variant="danger" className="gap-2" onClick={() => setStatusTarget("SUSPENDED")}>
                <ShieldAlert className="h-4 w-4" />
                Suspend
              </Button>
            )}
          </Can>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </span>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Shield className="h-4 w-4" /> Account Status
              </span>
              <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "danger" : "default"}>
                {user.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Clock className="h-4 w-4" /> Last Login
              </span>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Registered On
              </span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Access</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[rgb(var(--muted-foreground))] space-y-3">
            <p>
              Users inherit permissions based on assigned global system roles and workspace-level member roles.
            </p>
            <p>
              Status changes apply immediately across all active API sessions.
            </p>
          </CardContent>
        </Card>
      </div>

      <EditUserDialog
        user={user}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <UserStatusDialog
        user={user}
        targetStatus={statusTarget}
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      />
    </div>
  );
}
