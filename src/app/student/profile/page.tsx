"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { logout } from "@/lib/auth";
import {
  getMyProfile,
  downloadStudentIdCard,
} from "@/services/studentProfile.service";
import StudentIdCardModal from "@/components/student/StudentIdCardModal";

import {
  UserCircle,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  CalendarClock,
  User,
  IdCard,
  Download,
  Edit3,
  LogOut,
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openIdCard, setOpenIdCard] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getMyProfile();
        setProfile(result.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 animate-pulse font-medium text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-violet-50 opacity-50" />
          <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-32 rounded-full bg-blue-50 opacity-50" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-600 text-3xl font-bold text-white shadow-lg">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                profile.name
                  ?.trim()
                  .split(/\s+/)
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-400">
              {profile.studentId}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold text-violet-700">
              <GraduationCap size={16} /> Student
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <UserCircle className="text-violet-500" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Mail size={14} /> Email
              </div>
              <p className="break-all font-semibold text-slate-700">
                {profile.email || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Phone size={14} /> Mobile
              </div>
              <p className="font-semibold text-slate-700">
                {profile.phone || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BookOpen size={14} /> Board
              </div>
              <p className="font-semibold text-slate-700">
                {profile.board?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <GraduationCap size={14} /> Class
              </div>
              <p className="font-semibold text-slate-700">
                {profile.class?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <CalendarClock size={14} /> Session
              </div>
              <p className="font-semibold text-slate-700">
                {profile.academicSession?.name || "Not Available"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <User size={14} /> Assigned Teacher
              </div>
              <p className="font-semibold text-slate-700">
                {profile.teacher?.name || "Not Assigned"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <IdCard className="text-blue-500" /> Student Services
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setOpenIdCard(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md"
            >
              <IdCard size={20} /> View Digital ID
            </button>

            <button
              onClick={handleDownloadIdCard}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <Download size={20} /> Download PDF
            </button>
          </div>

          <StudentIdCardModal
            open={openIdCard}
            onClose={() => setOpenIdCard(false)}
            profile={profile}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Link
            href="/student/profile/edit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Edit3 size={18} /> Update Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 py-4 font-bold text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
