"use client";

import { useEffect, useState } from "react";
import { verifyStudentCard } from "@/services/verify.service";
import { GoUnverified } from "react-icons/go";
import { MdVerified } from "react-icons/md";

export default function VerifyPage({
  params,
}: {
  params: { studentId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await verifyStudentCard(params.studentId);

        setStudent(result.data);
      } catch (error) {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.studentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verifying...
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-[35px] bg-white p-8 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="text-6xl text-red-700"><GoUnverified /></div>

          <h1 className="mt-4 text-3xl font-bold text-red-600">
            Verification Failed
          </h1>

          <p className="mt-3 text-slate-600">
            This Student ID is invalid or has been revoked.
          </p>

          <p className="mt-6 text-sm text-slate-500">
            If you believe this is an error, please contact
            <br />
            North Bengal Cloud Academy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-[35px] bg-white p-8 text-center shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <span className="text-5xl text-green-600 "><MdVerified /></span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-700">Student Verified</h1>

        <p className="mt-2 text-slate-500">
          This student identity card is valid.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Student Name</p>
            <p className="font-semibold">{student.name}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Student ID</p>
            <p className="font-semibold">{student.studentId}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Class</p>
            <p className="font-semibold">{student.class}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Board</p>
            <p className="font-semibold">{student.board}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Academic Session</p>
            <p className="font-semibold">{student.session || "N/A"}</p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm text-green-700">Status</p>

            <p className="font-bold text-green-700">{student.status}</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-5">
          <p className="font-semibold text-slate-700">
            North Bengal Cloud Academy
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Student Identity Verification Portal
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Verified on {new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
