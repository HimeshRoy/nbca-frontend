"use client";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { viewStudentIdCard } from "@/services/studentProfile.service";
import { useEffect, useState } from "react";

interface StudentIdCardModalProps {
  open: boolean;

  onClose: () => void;

  profile: any;
}

export default function StudentIdCardModal({
  open,
  onClose,
  profile,
}: StudentIdCardModalProps) {
  if (!open) return null;

  const [pdfUrl, setPdfUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let objectUrl = "";

    const loadPdf = async () => {
      try {
        setLoading(true);

        const blob = await viewStudentIdCard();

        objectUrl = URL.createObjectURL(blob);

        setPdfUrl(objectUrl);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[35px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">🪪 Student ID Card</h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-slate-500 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex h-[75vh] items-center justify-center">
            <p className="text-slate-500">Loading ID Card...</p>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Student ID Card"
            className="h-[75vh] w-full"
          />
        ) : (
          <div className="flex h-[75vh] items-center justify-center">
            <p className="text-red-500">Failed to load ID Card.</p>
          </div>
        )}
      </div>
    </div>
  );
}
