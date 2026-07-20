"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

import {
  adminLogin,
  teacherLogin,
  studentLogin,
} from "@/services/auth.service";
import { saveToken } from "@/lib/auth";

import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-4">

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-violet-200/50 blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-indigo-200/50 blur-3xl opacity-50 -z-10" />

      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl opacity-60 -z-10" />

          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100">
              <Image src="/logo.png" alt="NBCA" width={64} height={64} className="object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Sign in to continue your learning journey
            </p>
          </div>
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-600">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
      
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Email or Student ID
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-600">
                  <Mail size={20} />
                </div>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  type="text"
                  placeholder="Enter email or student ID"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-600">
                  <Lock size={20} />
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-violet-600 transition-colors hover:text-violet-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-violet-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <LogIn size={20} />
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-10 border-t border-slate-100 pt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 font-bold text-violet-600 transition-colors hover:text-violet-700 hover:underline"
              >
                Create Student Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}