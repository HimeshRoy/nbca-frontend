"use client";

import { useEffect, useState } from "react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

import {
  getMyProfile,
  downloadStudentIdCard,
} from "@/services/studentProfile.service";
import StudentIdCardModal from "@/components/student/StudentIdCardModal";

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [openIdCard, setOpenIdCard] = useState(false);

  const handleDownloadIdCard = async () => {
    try {
      const blob = await downloadStudentIdCard();

      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = fileURL;

      link.setAttribute("download", "NBCA-ID-Card.pdf");

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Failed to download ID Card:", error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getMyProfile();

        setProfile(result.data);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleLogout = () => {
    logout();

    router.replace("/login");
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[35px] bg-white p-8 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex flex-col items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-4xl font-bold text-white">
              {profile.name
                ?.split(" ")
                .map((word: string) => word[0])
                .join("")
                .slice(0, 2)}
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-800">
              {profile.name}
            </h1>

            <p className="mt-2 text-slate-500">{profile.studentId}</p>

            <div className="mt-5 rounded-full bg-violet-100 px-5 py-2 text-sm font-semibold text-violet-700">
              🎓 Student
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-2xl font-bold text-slate-800">
            Personal Information
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>

              <p className="mt-1 font-semibold break-all">
                {profile.email || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Mobile</p>

              <p className="mt-1 font-semibold">
                {profile.mobile || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Board</p>

              <p className="mt-1 font-semibold">
                {profile.board?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Class</p>

              <p className="mt-1 font-semibold">
                {profile.class?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Academic Session</p>

              <p className="mt-1 font-semibold">
                {profile.academicSession?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Assigned Teacher</p>

              <p className="mt-1 font-semibold">
                {profile.teacher?.name || "Not Assigned"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-2xl font-bold text-slate-800">
            Student Services
          </h2>

          <div className="mt-6 space-y-4">
            <div className="space-y-4">
              <button
                onClick={() => setOpenIdCard(true)}
                className="w-full rounded-2xl bg-violet-600 px-5 py-4 font-semibold text-white transition hover:bg-violet-700"
              >
                View Digital ID Card
              </button>

              <button
                onClick={handleDownloadIdCard}
                className="w-full rounded-2xl bg-slate-200 px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                ⬇ Download PDF
              </button>
            </div>
            <StudentIdCardModal
              open={openIdCard}
              onClose={() => setOpenIdCard(false)}
              profile={profile}
            />
          </div>
        </div>
        <div className=" p-3">
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="w-full rounded-2xl py-3 bg-blue-600 font-semibold text-white transition hover:bg-blue-700">
              Update Profile
            </button>

            <button className="w-full rounded-2xl py-3 bg-red-600 font-semibold text-white transition hover:bg-red-700"
            onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
