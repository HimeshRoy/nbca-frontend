"use client";

import StudentBottomNav from "@/components/student/StudentBottomNav";
import StudentSidebar from "@/components/student/StudentSidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const pathname = usePathname();

  const hideBottomNav =
    pathname.includes("/student/tests/") && pathname.includes("/attempt");

  return (
    <div className="min-h-screen">
      <StudentSidebar />

      <main
        className="pb-24 md:pb-6 md:ml-72 bg-gradient-to-r
from-indigo-100/90
via-blue-50/90
to-purple-100/90
backdrop-blur-xl"
      >
        {children}
      </main>

{!hideBottomNav && <StudentBottomNav />}
    </div>
  );
}
