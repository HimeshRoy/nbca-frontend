"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  adminLogin,
  teacherLogin,
  studentLogin,
} from "@/services/auth.service";

import { saveToken } from "@/lib/auth";

import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      let result;

      if (identifier.includes("@")) {
        try {
          result = await adminLogin(identifier, password);

          saveToken(result.data.token);

          toast.success("Welcome Admin");
          router.push("/admin");

          return;
        } catch (error) {
          console.log("Admin Login Failed", error);
        }

        result = await teacherLogin(identifier, password);

        saveToken(result.data.token);

        toast.success("Welcome Teacher");
        router.push("/teacher");

        return;
      }

      result = await studentLogin(identifier, password);

      saveToken(result.data.token);

      toast.success("Welcome Student");
      router.replace("/student-loader");
    } catch (error: any) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ">
              <Image src="/logo.png" alt="NBCA" width={80} height={80} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

            <p className="mt-2 text-gray-600">
              Login to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email or Student ID
              </label>

              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                placeholder="Enter email or student ID"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 py-3 font-semibold text-white"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-8 border-t pt-6 text-center">
            <p className="text-gray-600">Don't have an account?</p>

            <Link
              href="/signup"
              className="mt-2 inline-block font-semibold text-blue-700 hover:underline"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
