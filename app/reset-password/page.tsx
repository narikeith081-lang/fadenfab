"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= CHECK SESSION =================
  useEffect(() => {
    // Check if we have an active session (temporary or recovered from hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If no session is present, they shouldn't be here directly unless from email link
        console.warn("No active session detected on mount. Ensure you followed the reset link from your email.");
      }
    });
  }, []);

  // ================= RESET SUBMIT =================
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess("Your password has been reset successfully. Redirecting to login...");

      // Automatically sign out to force fresh login and redirect to login page
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/userlogin");
      }, 2500);

    } catch (err: any) {
      setError(err.message || "Failed to update password. Please request a new link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#0D4A86]">
            FADENFAB
          </h1>
          <p className="mt-3 text-slate-600">
            Set a new password for your account
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
          {/* Password */}
          <div>
            <label className="block font-medium text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-3 pr-12 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-3 pr-12 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 rounded-xl p-3 text-sm">
              {success}
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0D4A86] py-3 font-bold text-white hover:bg-[#083A6B] transition disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link
            href="/userlogin"
            className="text-sm font-semibold text-[#0D4A86] hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}
