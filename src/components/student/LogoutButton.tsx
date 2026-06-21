"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");

    toast.success("Logged out successfully");

    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-2xl bg-red-500 py-3 font-semibold text-white"
    >
      Logout
    </button>
  );
}