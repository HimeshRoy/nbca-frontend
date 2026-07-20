"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import StudentSidebar from "@/components/student/StudentSidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const hideBottomNav =
    pathname.includes("/student/tests/") && pathname.includes("/attempt");

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden flex">
      
      <StudentSidebar />

      <main
        className={`
          flex-1
          w-full
          min-h-screen
          transition-all duration-300 ease-in-out
          ${hideBottomNav ? "pb-6" : "pb-24"} 
          md:pb-8 
          md:ml-72 
          md:px-6
          md:pt-6
        `}
      >
        <div className="mx-auto w-full max-w-7xl h-full animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {!hideBottomNav && (
        <div className="md:hidden block">
          <StudentBottomNav />
        </div>
      )}
      
    </div>
  );
}