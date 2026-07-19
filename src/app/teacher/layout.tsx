"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import TeacherLogoutButton from "@/components/ui/TeacherLogoutButton";
import { 
  FaHome, 
  FaFileAlt, 
  FaClipboardList, 
  FaVideo, 
  FaBook, 
  FaUsers, 
  FaBullhorn, 
  FaUser 
} from "react-icons/fa";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/teacher", icon: FaHome },
    { name: "Assignments", href: "/teacher/assignments", icon: FaFileAlt },
    { name: "Tests", href: "/teacher/tests", icon: FaClipboardList },
    { name: "Live Classes", href: "/teacher/live-classes", icon: FaVideo },
    { name: "Study Materials", href: "/teacher/study-materials", icon: FaBook },
    { name: "Students", href: "/teacher/students", icon: FaUsers },
    { name: "Notices", href: "/teacher/notices", icon: FaBullhorn },
    { name: "Profile", href: "/teacher/profile", icon: FaUser },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-slate-300 flex-col fixed left-0 top-0 rounded-br-3xl rounded-tr-3xl shadow-xl z-50">

        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="NBCA" width={40} height={40} className="rounded-full" />
            <h2 className="text-xl font-bold text-white tracking-wide">NBCA Teacher</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-3 p-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-medium shadow-md"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`text-lg ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <TeacherLogoutButton />
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}