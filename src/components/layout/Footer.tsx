import Link from "next/link";
import { Mail, MapPin, } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          <div className="lg:pr-8">
            <h3 className="text-3xl font-black text-white tracking-tight">NBCA<span className="text-blue-500">.</span></h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              North Bengal Cloud Academy provides structured, premium online learning for CBSE, ICSE, and WBBSE students, empowering the next generation of achievers.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"><FaFacebook className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"><FaTwitter className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"><FaInstagram className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <Link href="/" className="transition-colors hover:text-blue-400">Home</Link>
              <Link href="/about" className="transition-colors hover:text-blue-400">About Us</Link>
              <Link href="/courses" className="transition-colors hover:text-blue-400">Our Courses</Link>
              <Link href="/contact" className="transition-colors hover:text-blue-400">Contact Support</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Supported Boards</h4>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> CBSE</span>
              <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div> ICSE</span>
              <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div> WBBSE</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h4>
            <div className="mt-6 flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>support@nbca.co.in</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Jalpaiguri, West Bengal<br/>Online Learning Platform</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} North Bengal Cloud Academy. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}