"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/config/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="NBCA" width={50} height={50} />

            <div>
              <h1 className="font-bold text-blue-900 text-xl">NBCA</h1>

              <p className="text-sm text-gray-600">
                North Bengal Cloud Academy
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-gray-800 hover:text-blue-700"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="border px-4 py-2 rounded-lg text-gray-700"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-blue-900 text-white px-5 py-2 rounded-lg"
            >
              Enroll Now
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden">
            {open ? (
              <X className="text-blue-900" />
            ) : (
              <Menu className="text-blue-900" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-white">
          <div className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="py-3 text-gray-800"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/login"
              className="mt-4 border rounded-lg px-4 py-3 text-center text-blue-900"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="mt-2 bg-blue-900 text-white rounded-lg px-4 py-3 text-center"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
