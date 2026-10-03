"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Loader2, ArrowRight, Phone } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    mobileNumber: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await registerApi({
        name: data.name,
        email: data.email,
        mobileNumber: data.mobileNumber || undefined,
        password: data.password,
      });

      setAuth(response.user, response.accessToken);
      toast.success("Account created successfully", "Welcome to ApiAura!");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      toast.error(msg, "Registration Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-5 rounded-3xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/70 p-8 shadow-2xl backdrop-blur-2xl glass-card"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[rgb(var(--primary))] to-indigo-500 text-white font-bold shadow-lg shadow-[rgb(var(--primary))]/20">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[rgb(var(--foreground))]">
            Join ApiAura
          </h1>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Create an account to start testing and orchestrating APIs.
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-semibold text-[rgb(var(--foreground))]">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className="w-full rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--background))]/60 pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] transition"
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="reg-email" className="text-xs font-semibold text-[rgb(var(--foreground))]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--background))]/60 pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] transition"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile Number (Optional) */}
        <div className="space-y-1">
          <label htmlFor="mobileNumber" className="text-xs font-semibold text-[rgb(var(--foreground))] flex items-center justify-between">
            <span>Mobile Number</span>
            <span className="text-[10px] text-[rgb(var(--muted-foreground))] font-normal">Optional</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="mobileNumber"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register("mobileNumber")}
              className="w-full rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--background))]/60 pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] transition"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="reg-password" className="text-xs font-semibold text-[rgb(var(--foreground))]">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--background))]/60 pl-9 pr-10 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-[rgb(var(--foreground))]">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-[rgb(var(--border))]/60 bg-[rgb(var(--background))]/60 pl-9 pr-3 py-2 text-sm text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] transition"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 font-semibold rounded-xl gap-2 bg-gradient-to-r from-[rgb(var(--primary))] to-indigo-600 hover:opacity-95 shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="pt-2 text-center text-xs text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--border))]/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[rgb(var(--primary))] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}
