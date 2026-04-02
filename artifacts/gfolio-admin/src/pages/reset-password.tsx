import * as React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";
import { customFetch } from "@workspace/api-client-react";
import { buildAuthApiUrl } from "@/lib/api-config";

const RESET_PASSWORD_ENDPOINT = buildAuthApiUrl("/auth/resetPassword");

type ResetPasswordResponse = {
  message?: string;
};

export default function ResetPassword() {
  const [location, navigate] = useLocation();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const token = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") ?? "";
  }, [location]);

  async function handleResetPassword() {
    const passwordValue = password;
    const confirmationValue = confirmPassword;

    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "This reset link is missing a token. Please request a new password reset email.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordValue.trim()) {
      toast({ title: "Missing password", description: "Enter your new password." });
      return;
    }

    if (!confirmationValue.trim()) {
      toast({ title: "Missing confirmation", description: "Confirm your new password." });
      return;
    }

    if (passwordValue !== confirmationValue) {
      toast({ title: "Passwords do not match", description: "Make sure both password fields match." });
      return;
    }

    setLoading(true);

    try {
      const response = await customFetch<ResetPasswordResponse>(RESET_PASSWORD_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: passwordValue,
        }),
      });

      toast({
        title: "Password updated",
        description:
          response?.message ?? "Your password has been changed. Please login with the new password.",
      });
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error?.message || "Unable to update your password right now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#032f31] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-8 py-10 sm:px-12 lg:px-20">
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <img src={logo} alt="Gfolio logo" className="max-h-full w-auto object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-light tracking-wide text-white">Gfolio</p>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-200/70">Reset Password</p>
            </div>
          </div>
        </div>

        <div className="mx-10 hidden h-[320px] w-px bg-white/35 lg:block" />

        <div className="flex flex-1 justify-center lg:justify-start">
          <div className="w-full max-w-[360px] space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-light tracking-wide text-white">Set New Password</h1>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">
                Enter and confirm your new password.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleResetPassword();
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className="h-10 rounded-sm border-[#cfd7da] bg-[#eef2f3] pr-10 text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="h-10 rounded-sm border-[#cfd7da] bg-[#eef2f3] pr-10 text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 transition hover:text-slate-700"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <Button
                  className="h-9 w-full rounded-sm border-0 bg-emerald-500 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-none transition hover:bg-emerald-400 cursor-pointer"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Change Password"}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mx-auto block cursor-pointer text-center text-[10px] uppercase tracking-[0.22em] text-white/55 transition hover:text-emerald-200"
                >
                  Back to login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
