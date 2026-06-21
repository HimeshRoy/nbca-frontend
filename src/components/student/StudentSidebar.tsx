"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentSidebar() {
  const pathname = usePathname();

  const menus = [
    {
      label: "Dashboard",
      icon: "🏠",
      href: "/student",
    },
    {
      label: "Study Materials",
      icon: "📚",
      href: "/student/study-materials",
    },
    {
      label: "Assignments",
      icon: "📝",
      href: "/student/assignments",
    },
    {
      label: "Live Classes",
      icon: "🎥",
      href: "/student/live-classes",
    },
    {
      label: "Tests",
      icon: "🏆",
      href: "/student/tests",
    },
    {
      label: "Notices",
      icon: "🔔",
      href: "/student/notices",
    },
    {
      label: "Profile",
      icon: "👤",
      href: "/student/profile",
    },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col border-r border-white/20 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 backdrop-blur-xl">

      <div className="p-8">

        <h1 className="text-2xl font-bold text-violet-600">
          NBCA
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Student Portal
        </p>

      </div>

      <nav className="flex-1 px-4">

        <div className="space-y-2">

          {menus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition

              ${
                pathname === item.href
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-white"
              }
              `}
            >
              <span className="text-xl">
                {item.icon}
              </span>

              <span className="font-medium">
                {item.label}
              </span>

            </Link>
          ))}

        </div>

      </nav>

    </aside>
  );
}