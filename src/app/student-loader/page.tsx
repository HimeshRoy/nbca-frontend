"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLoader from "@/components/common/AppLoader";
import { getStudentDashboard } from "@/services/dashboard.service";

export default function StudentLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          getStudentDashboard(),
          new Promise((resolve) => setTimeout(resolve, 7000)),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        router.replace("/student");
      }
    };

    load();
  }, [router]);

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        <AppLoader />
      </div>
    </div>
  );
}
