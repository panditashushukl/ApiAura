"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/use-login";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const loginMutation = useLogin();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Successfully logged in", "Welcome back");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to sign in", "Authentication Error");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-xl"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]">
          Welcome to ApiAura
        </h1>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Sign in to access your API collections, workflows, and workspace.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-[rgb(var(--foreground))]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-[rgb(var(--danger))]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-[rgb(var(--foreground))]"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-[rgb(var(--danger))]">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {loginMutation.isError && (
        <div className="rounded-lg border border-[rgb(var(--danger))/0.3] bg-[rgb(var(--danger))/0.1] p-3 text-xs text-[rgb(var(--danger))]">
          {loginMutation.error?.message || "Invalid credentials. Please try again."}
        </div>
      )}

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-10 font-medium"
      >
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}