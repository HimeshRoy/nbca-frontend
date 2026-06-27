"use client";

import { Home, NotebookTabs, StickyNotePlus, Bell, UserRoundPen, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentBottomNav() {
  const pathname = usePathname();

  const menus = [
    {
      name: "Learn",
      icon: <NotebookTabs />,
      href: "/student/study-materials",
    },
    {
      name: "Tasks",
      icon: <StickyNotePlus />,
      href: "/student/assignments",
    },
     {
      name: "Home",
      icon: <Home />,
      href: "/student",
    },
    {
      name: "Test",
      icon: <BookOpenCheck />,
      href: "/student/tests",
    },
    {
      name: "Notices",
      icon: <Bell />,
      href: "/student/notices",
    },
    // {
    //   name: "Profile",
    //   icon: <UserRoundPen />,
    //   href: "/student/profile",
    // },
  ];

  return (
    <div
      className="
fixed bottom-4 left-4 right-4 z-50
rounded-3xl
border border-white/30
bg-white/20
backdrop-blur-2xl
shadow-xl
md:hidden
"
    >
      <div className="grid grid-cols-5 gap-3">
        {menus.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-3 text-xs transition

            ${pathname === item.href ? "text-violet-600" : "text-slate-500"}
            `}
          >
            <span className="text-xl">{item.icon}</span>

            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
