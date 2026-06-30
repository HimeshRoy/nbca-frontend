"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-violet-50 p-6">
      <div className="max-w-lg text-center">

        <div className="flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert
              size={60}
              className="text-red-600"
            />
          </div>
        </div>

        <h1 className="mt-8 text-7xl font-extrabold text-slate-800">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold text-slate-700">
          Page Not Found
        </h2>

        <p className="mt-4 text-slate-500 leading-7">
          Oops! The page you're looking for doesn't exist,
          has been moved, or the URL may be incorrect.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-10 text-sm text-slate-400">
          North Bengal Cloud Academy
        </p>

      </div>
    </div>
  );
}