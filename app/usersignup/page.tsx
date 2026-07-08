"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function UserSignup() {
  const router = useRouter();

  // ============================
  // State Variables
  // ============================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

    // ============================
  // Signup Function
  // ============================

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!mobile.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
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

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Unable to create account.");
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            mobile: mobile,
          });

      if (profileError) throw profileError;

      setSuccess(
        "Account created successfully! Redirecting..."
      );

      setTimeout(() => {
        router.push("/userlogin");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
            Create your customer account
          </p>

        </div>

        <form
          onSubmit={handleSignup}
          className="mt-8 space-y-5"
        >

          {/* Full Name */}

          <div>

            <label className="font-medium text-slate-700">
              Full Name
            </label>

          <input
  type="text"
  placeholder="John Doe"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
/>

          </div>

          {/* Email */}

          <div>

            <label className="font-medium text-slate-700">
              Email
            </label>

            <input
  type="email"
  placeholder="john@gmail.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
/>

          </div>

          {/* Mobile */}

          <div>

            <label className="font-medium text-slate-700">
              Mobile Number
            </label>

            <input
  type="tel"
  placeholder="9876543210"
  value={mobile}
  onChange={(e) => setMobile(e.target.value)}
  className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
/>

          </div>

          {/* Password */}

          <div>

            <label className="font-medium text-slate-700">
              Password
            </label>

            <div className="relative">

              <input
  type={showPassword ? "text" : "password"}
  placeholder="********"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
/>

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-6"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-slate-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-slate-500" />
                )}
              </button>

            </div>

          </div>

          {/* Confirm Password */}

          <div>

            <label className="font-medium text-slate-700">
              Confirm Password
            </label>

            <div className="relative">

              <input
  type={showConfirmPassword ? "text" : "password"}
  placeholder="********"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20"
/>

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-6"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-slate-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-slate-500" />
                )}
              </button>

            </div>

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
  className="w-full rounded-xl bg-[#0D4A86] py-3 font-bold text-white transition hover:bg-[#083A6B] disabled:opacity-50"
>
  {loading ? "Creating Account..." : "Create Account"}
</button>

        </form>

        <div className="mt-8 text-center">
  <p className="text-gray-600">
    Already have an account?
    <Link
      href="/userlogin"
      className="ml-2 font-semibold text-[#0D4A86] hover:underline"
    >
      Login
    </Link>
  </p>
</div>

      </div>

    </main>
  );
}