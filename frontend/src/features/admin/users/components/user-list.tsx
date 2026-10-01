"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Edit, ShieldAlert, Trash2, Eye, UserCheck, AlertCircle } from "lucide-react";

import { useUsers } from "../hooks/use-users";
import { useDeleteUser } from "../hooks/use-delete-user";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserStatusDialog } from "./user-status-dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Can } from "@/features/auth/components/can";
import { User, UserStatus } from "../types/user.types";
import { useToast } from "@/components/feedback/toast-system";

export function UserList() {
  const { data: users = [], isLoading, isError, error, refetch } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statusTargetUser, setStatusTargetUser] = useState<{ user: User; targetStatus: UserStatus } | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        search.trim() === "" ||
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const handleDelete = () => {
    if (!deletingUser) return;
    deleteUserMutation.mutate(deletingUser.id, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setDeletingUser(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete user");
      },
    });
  };

  if (isLoading) return <LoadingState message="Loading users..." />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : "Failed to load users."} onRetry={() => refetch()} />;

  return (
    <Can permission="USER_READ" fallback={<ErrorState title="Access Denied" message="You do not have permission to view users." />}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
            <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              View, edit, activate, suspend, and configure platform user permissions.
            </p>
          </div>

          <Can permission="USER_CREATE">
            <CreateUserDialog />
          </Can>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Table */}
        {paginatedUsers.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="w-10 h-10 text-[rgb(var(--muted-foreground))]" />}
            title="No Users Found"
            description={search || statusFilter !== "ALL" ? "Try adjusting your search filters." : "No users have registered yet."}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50 text-left text-xs font-medium text-[rgb(var(--muted-foreground))]">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[rgb(var(--muted))]/30">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[rgb(var(--foreground))]">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-[rgb(var(--muted-foreground))]">
                        {user.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          user.status === "ACTIVE"
                            ? "success"
                            : user.status === "SUSPENDED"
                            ? "danger"
                            : "default"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-[rgb(var(--muted-foreground))]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right space-x-1">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="icon" title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Can permission="USER_UPDATE">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Profile"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {user.status !== "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Activate User"
                            onClick={() => setStatusTargetUser({ user, targetStatus: "ACTIVE" })}
                          >
                            <UserCheck className="h-4 w-4 text-[rgb(var(--success))]" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Suspend User"
                            onClick={() => setStatusTargetUser({ user, targetStatus: "SUSPENDED" })}
                          >
                            <ShieldAlert className="h-4 w-4 text-[rgb(var(--warning))]" />
                          </Button>
                        )}
                      </Can>

                      <Can permission="USER_DELETE">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete User"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="h-4 w-4 text-[rgb(var(--danger))]" />
                        </Button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-5 py-3">
                <div className="text-xs text-[rgb(var(--muted-foreground))]">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <EditUserDialog
          user={editingUser}
          open={Boolean(editingUser)}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />

        <UserStatusDialog
          user={statusTargetUser?.user ?? null}
          targetStatus={statusTargetUser?.targetStatus ?? null}
          open={Boolean(statusTargetUser)}
          onOpenChange={(open) => !open && setStatusTargetUser(null)}
        />

        <ConfirmDialog
          open={Boolean(deletingUser)}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          title="Delete User"
          description={`Are you sure you want to permanently delete user "${deletingUser?.name || deletingUser?.email}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
        />
      </div>
    </Can>
  );
}