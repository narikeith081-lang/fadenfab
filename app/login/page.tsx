"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Contact from "../components/Contact";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ ENV credentials
  const adminUser =
    process.env.NEXT_PUBLIC_ADMIN_USERNAME;

  const adminPass =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // ✅ Auto redirect
  useEffect(() => {
    const isAdmin =
      localStorage.getItem("FADENFAB_admin");

    if (isAdmin === "true") {
      router.push("/admin");
    }
  }, [router]);

  // ✅ Login
  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ Secure ENV login
      if (
        username === adminUser &&
        password === adminPass
      ) {
        localStorage.setItem(
          "fadenfab_admin",
          "true"
        );

        localStorage.setItem(
          "fadenfab_admin_name",
          username
        );

        router.push("/admin");

      } else {
        setError(
          "Invalid username or password"
        );
      }

    } catch (err) {
      console.error(err);

      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.25),transparent_50%),linear-gradient(to_bottom,#000000,#111111)]" />

      {/* Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="w-full max-w-md bg-[#111111]/90 border border-amber-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
      >

        {/* Header */}
        <div className="text-center mb-8">

        <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-wider">
  FADENFAB
</h1>

          <p className="text-gray-400 mt-3">
            Admin Dashboard Login
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Username */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-2xl px-5 py-4 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-gold-400 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black py-4 rounded-2xl font-bold transition duration-300 shadow-lg shadow-yellow-500/20 disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
<button
  type="button"
  onClick={() => {
    window.location.href = "/";
  }}
  className="w-full border border-amber-500/20 hover:bg-amber-500/10 py-4 rounded-2xl font-semibold text-amber-300 transition"
>
  Back to Home
</button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          FADENFAB Admin Panel
        </div>

      </motion.div>
    </main>
  );
}