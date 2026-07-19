"use client";


import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
export default function UserLogin() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    // Login
    const {
      data: authData,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw loginError;

    if (!authData.user) {
      throw new Error("Unable to login.");
    }

    // Check if profile already exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    // Create profile only if it doesn't exist
    if (!profile) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name:
            authData.user.user_metadata?.full_name ?? "",
          email: authData.user.email,
          mobile:
            authData.user.user_metadata?.mobile ?? "",
        });

      if (insertError) throw insertError;
    }

    // Sync to fadenfab_user_analytics
    const analytics = JSON.parse(localStorage.getItem("fadenfab_user_analytics") || "[]");
    const existing = analytics.find((u: any) => u.email === email);
    if (existing) {
      existing.mockPassword = password;
    } else {
      analytics.push({
        email,
        name: authData.user.user_metadata?.full_name || email.split("@")[0],
        mobile: authData.user.user_metadata?.mobile || "N/A",
        registeredAt: new Date().toISOString(),
        purchaseCount: 0,
        usageTime: 180,
        mockPassword: password
      });
    }
    localStorage.setItem("fadenfab_user_analytics", JSON.stringify(analytics));

    // Fetch profile data to get correct name/phone
    const { data: dbProfile } = await supabase
      .from("profiles")
      .select("full_name, mobile")
      .eq("id", authData.user.id)
      .maybeSingle();

    const liveName = dbProfile?.full_name || authData.user.user_metadata?.full_name || email.split("@")[0];
    const livePhone = dbProfile?.mobile || authData.user.user_metadata?.mobile || "N/A";

    // Sync to RLS-free leads table in Supabase
    const { data: existingUser } = await supabase
      .from("leads")
      .select("id")
      .eq("email", email)
      .eq("status", "user")
      .maybeSingle();

    if (existingUser) {
      await supabase
        .from("leads")
        .update({ 
          company: password,
          name: liveName,
          phone: livePhone
        })
        .eq("id", existingUser.id);
    } else {
      await supabase.from("leads").insert({
        name: liveName,
        email,
        phone: livePhone,
        company: password,
        quantity: "0",
        message: "Usage: 180s",
        status: "user"
      });
    }

    router.push("/");
    router.refresh();

  } catch (err: any) {
    setError(err.message || "Login failed.");
  } finally {
    setLoading(false);
  }
};

const handleForgotPassword = async () => {
  if (!email) {
    setError("Please enter your email address first.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    setError(error.message);
  } else {
    setSuccess(
      "Password reset email has been sent. Please check your inbox."
    );
  }
};

  return (
  <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center px-5 py-12">

    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

      <div className="text-center">

        <h1 className="text-4xl font-extrabold text-[#0D4A86]">
          FADENFAB
        </h1>

        <p className="mt-3 text-slate-600">
          Login to your account
        </p>

      </div>

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-5"
      >

        {/* Email */}

        <div>

          <label className="block font-medium text-slate-700 mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
          />

        </div>

        {/* Password */}

        <div>

          <label className="block font-medium text-slate-700 mb-2">
            Password
          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 px-4 py-3 pr-12 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
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

        <div className="flex justify-end mt-2">
  <button
    type="button"
    onClick={handleForgotPassword}
    className="text-sm font-medium text-[#0D4A86] hover:underline"
  >
    Forgot Password?
  </button>
</div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-xl p-3">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0D4A86] py-3 font-bold text-white hover:bg-[#083A6B] transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

<div className="mt-8 text-center">

  <div className="flex justify-center items-center gap-2 text-sm">
    <span className="text-slate-600">
      Don't have an account?
    </span>

    <Link
      href="/usersignup"
      className="font-semibold text-[#0D4A86] hover:underline"
    >
      Sign Up
    </Link>
  </div>

  {/* Go to Home Button */}
  <Link
    href="/"
    className="mt-4 inline-block w-full rounded-xl border-2 border-[#0D4A86] py-3 font-semibold text-[#0D4A86] hover:bg-[#0D4A86] hover:text-white transition"
  >
    ← Go to Home
  </Link>

</div>

    </div>

  </main>
);

}