"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Your admin credentials
    const adminEmail = "admin@threads.com";
    const adminPassword = "threads123";

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("threads_admin", "true");

      router.push("/admin");
    } else {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">

      <form
        onSubmit={handleLogin}
        className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-3xl w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
          THREADS ADMIN
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-4 rounded-xl bg-black text-white border border-white/10 mb-5"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-4 rounded-xl bg-black text-white border border-white/10 mb-6"
        />

        <button className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold hover:bg-yellow-300 transition">
          Login
        </button>
      </form>
    </div>
  );
}