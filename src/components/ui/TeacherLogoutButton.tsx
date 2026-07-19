"use client";

import { LogOut } from "lucide-react";

export default function TeacherLogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-all duration-200 hover:bg-rose-300 hover:text-white hover:shadow-md hover:shadow-rose-200/50 cursor-pointer"
    >
      <span>Logout</span>
      <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  );
}