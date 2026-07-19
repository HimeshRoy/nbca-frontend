"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/config/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
              <Image src="/logo.png" alt="NBCA Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">NBCA<span className="text-blue-500 text-2xl">.</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">North Bengal Cloud</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200"
            >
              Enroll Now
            </Link>
          </div>

          <button 
            onClick={() => setOpen(!open)} 
            className="md:hidden rounded-xl bg-slate-50 p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-20 left-0 w-full border-b border-slate-200 bg-white px-4 py-6 shadow-xl md:hidden animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px w-full bg-slate-100 my-2"></div>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}