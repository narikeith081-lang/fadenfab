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

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {

      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({

          email,

          password,

        });

      if (error) throw error;

      router.push("/");

      router.refresh();

    } catch (err: any) {

      setError(err.message);

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

            Login to your account

          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="font-medium">

              Email

            </label>

            <input
              type="email"
              placeholder="john@gmail.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3"
            />

          </div>

          <div>

            <label className="font-medium">

              Password

            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="********"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full mt-2 border rounded-xl px-4 py-3 pr-12"
              />

              <button
                type="button"
                onClick={()=>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-6"
              >

                {
                  showPassword
                  ?

                  <EyeSlashIcon className="w-5 h-5"/>

                  :

                  <EyeIcon className="w-5 h-5"/>

                }

              </button>

            </div>

          </div>

          {

            error &&

            <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-3">

              {error}

            </div>

          }

          <button

            disabled={loading}

            className="w-full bg-[#0D4A86] text-white py-3 rounded-xl font-bold"

          >

            {

              loading

              ?

              "Signing In..."

              :

              "Login"

            }

          </button>

        </form>

        <div className="text-center mt-8">

          Don't have an account?

          <Link
            href="/usersignup"
            className="text-blue-700 font-bold ml-2 "
          >

            Signup

          </Link>

        </div>

      </div>

    </main>

  );

}