"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Video, 
  Trophy, 
  Bell, 
  UserCircle 
} from "lucide-react";

export default function StudentSidebar() {
  const pathname = usePathname();

  const menus = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/student",
    },
    {
      label: "Study Materials",
      icon: <BookOpen size={20} />,
      href: "/student/study-materials",
    },
    {
      label: "Assignments",
      icon: <FileText size={20} />,
      href: "/student/assignments",
    },
    {
      label: "Live Classes",
      icon: <Video size={20} />,
      href: "/student/live-classes",
    },
    {
      label: "Tests",
      icon: <Trophy size={20} />,
      href: "/student/tests",
    },
    {
      label: "Notices",
      icon: <Bell size={20} />,
      href: "/student/notices",
    },
    {
      label: "Profile",
      icon: <UserCircle size={20} />,
      href: "/student/profile",
    },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] flex-col border-r border-slate-200 bg-white">
      
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-md shadow-violet-200 p-1">
            <img src="logo.png" alt="" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              NBCA<span className="text-2xl text-blue-600">.</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Student Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="space-y-1.5">
          {menus.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 font-bold transition-all duration-200
                  ${isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >
                <div className={`
                  transition-transform duration-200 
                  ${isActive ? "scale-110" : "group-hover:scale-110"}
                `}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 text-center">
            © {new Date().getFullYear()} NBCA Academy
          </p>
        </div>
      </div>
    </aside>
  );
}