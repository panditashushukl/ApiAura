import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))] p-4 relative overflow-hidden">
      {/* Subtle Background Glow Orbs for Glassmorphism */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[rgb(var(--primary))]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <RegisterForm />
    </div>
  );
}
