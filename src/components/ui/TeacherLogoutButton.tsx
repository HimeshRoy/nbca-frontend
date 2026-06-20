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
      className="w-full rounded-lg px-4 py-3 bg-red-500 felx justify-center items-center hover:cursor-pointer"
    >
      <span className="flex gap-3 text-center justify-center items-center">Logout <LogOut /></span>
    </button>
  );
}
