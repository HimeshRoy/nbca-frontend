"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePhotoCropModal from "@/components/student/ProfilePhotoCropModal";
import {
  getMyProfile,
  updateMyProfile,
} from "@/services/studentProfile.service";
import { uploadFile } from "@/services/upload.service";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",

    email: "",

    phone: "",

    gender: "",

    address: "",

    guardianName: "",

    guardianPhone: "",
  });

  const [academicInfo, setAcademicInfo] = useState({
    studentId: "",
    board: "",
    className: "",
    session: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [photoUpdateCount, setPhotoUpdateCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [photoChangesRemaining, setPhotoChangesRemaining] = useState(3);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getMyProfile();

        setCurrentPhoto(result.data.photo || "");
        setProfile(result.data);

        setForm({
          name: result.data.name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          gender: result.data.gender || "",
          address: result.data.address || "",
          guardianName: result.data.guardianName || "",
          guardianPhone: result.data.guardianPhone || "",
        });

        setAcademicInfo({
          studentId: result.data.studentId || "",
          board: result.data.board?.name || "",
          className: result.data.class?.name || "",
          session: result.data.academicSession?.name || "",
        });

        setPhotoUpdateCount(result.data.photoUpdateCount || 0);

        setPhotoChangesRemaining(result.data.photoChangesRemaining ?? 3);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const changed =
      form.name !== (profile.name || "") ||
      form.email !== (profile.email || "") ||
      form.phone !== (profile.phone || "") ||
      form.gender !== (profile.gender || "") ||
      form.address !== (profile.address || "") ||
      form.guardianName !== (profile.guardianName || "") ||
      form.guardianPhone !== (profile.guardianPhone || "") ||
      croppedFile !== null;

    setHasUnsavedChanges(changed);
  }, [form, croppedFile, profile]);

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <DotLottieReact
          src="https://lottie.host/76c6039e-b54f-404a-a86e-c59b4cd8f120/YjiU8gWpwg.lottie"
          loop
          autoplay
        />
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);

    setPreviewImage(preview);
    setCropModalOpen(true);

    setForm((prev) => ({
      ...prev,
      photo: file,
    }));
  };

  const handleCropSave = (blob: Blob, preview: string) => {
    const file = new File([blob], "profile-photo.jpg", {
      type: "image/jpeg",
    });

    setCroppedFile(file);

    setPreviewImage(preview);

    setCropModalOpen(false);
  };

  const handleUpdateProfile = async () => {
    try {
      const hasProfileChanges =
        form.name !== profile.name ||
        form.email !== profile.email ||
        form.phone !== profile.phone ||
        form.gender !== profile.gender ||
        form.address !== profile.address ||
        form.guardianName !== profile.guardianName ||
        form.guardianPhone !== profile.guardianPhone ||
        !!croppedFile;

      setSaving(true);

      let photoUrl = currentPhoto;

      if (croppedFile) {
        const upload = await uploadFile(croppedFile);

        photoUrl = upload.data.fileUrl;
      }

      const payload: any = {};

      if (form.name !== profile.name) payload.name = form.name;
      if (form.email !== profile.email) payload.email = form.email;
      if (form.phone !== profile.phone) payload.phone = form.phone;
      if (form.gender !== profile.gender) payload.gender = form.gender;
      if (form.address !== profile.address) payload.address = form.address;
      if (form.guardianName !== profile.guardianName)
        payload.guardianName = form.guardianName;
      if (form.guardianPhone !== profile.guardianPhone)
        payload.guardianPhone = form.guardianPhone;

      if (photoUrl !== currentPhoto) {
        payload.photo = photoUrl;
      }

      if (!hasProfileChanges) {
        toast.info("No changes to save.");
        return;
      }

      await updateMyProfile(payload);
      setHasUnsavedChanges(false);

      setProfile((prev: any) => ({
        ...prev,
        ...payload,
      }));

      if (payload.photo) {
        setCurrentPhoto(payload.photo);
      }

      setPreviewImage("");

      setCroppedFile(null);

      toast.success("Profile updated successfully.");

      router.replace("/student/profile");
      router.refresh();
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.message || "Failed to update profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mx-auto max-w-lg">
        <div className="rounded-[35px] bg-white p-8 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-4xl font-bold text-white">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  form.name
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                )}
              </div>

              <label
                htmlFor={photoChangesRemaining === 0 ? undefined : "photo"}
                className={`absolute bottom-0 right-0 rounded-full p-3 text-white shadow-lg ${
                  photoChangesRemaining === 0
                    ? "cursor-not-allowed bg-slate-400"
                    : "cursor-pointer bg-violet-600"
                }`}
              >
                <Camera size={20} />
              </label>

              <input
                title="photo"
                id="photo"
                type="file"
                accept="image/*"
                disabled={photoChangesRemaining === 0}
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-center">
              <p className="mt-1 text-xs text-slate-500">
                {photoChangesRemaining === 0
                  ? "No photo changes remaining."
                  : photoChangesRemaining === 1
                    ? "Last photo change remaining."
                    : `${photoChangesRemaining} lifetime profile photo changes remaining.`}
              </p>
            </div>

            <h2 className="mt-6 text-2xl font-bold">Update Profile</h2>

            <p className="mt-2 text-slate-500">
              Keep your personal information up to date.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold text-slate-800">
            Personal Information
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Full Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Email Address
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Mobile Number
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Gender
              </label>

              <select
                title="gender"
                value={form.gender}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gender: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-500"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold text-slate-800">Family & Address</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Address
              </label>

              <textarea
                rows={2}
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Guardian Name
              </label>

              <input
                type="text"
                value={form.guardianName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    guardianName: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter guardian name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Guardian Phone
              </label>

              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    guardianPhone: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500"
                placeholder="Enter guardian phone"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <div className="grid grid-cols-2 gap-6 items-center">
            <h2 className="text-xl font-bold text-slate-800">
              Academic Information
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-3 text-center text-sm font-semibold text-slate-600">
              🔒 Read Only
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Student ID</p>

              <p className="mt-1 font-semibold">{academicInfo.studentId}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Board</p>

              <p className="mt-1 font-semibold">{academicInfo.board}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Class</p>

              <p className="mt-1 font-semibold">{academicInfo.className}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Academic Session</p>

              <p className="mt-1 font-semibold">{academicInfo.session}</p>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            These academic details are managed by the academy and cannot be
            edited by students.
          </p>
        </div>

        <div className="mt-6 rounded-[35px] bg-white p-6 shadow-[18px_18px_45px_#d9d9d9,-18px_-18px_45px_#ffffff]">
          <h2 className="text-xl font-bold text-slate-800">Save Changes</h2>

          <p className="mt-2 text-sm text-slate-500">
            Review your information before saving. Your academic details cannot
            be changed.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setShowDiscardModal(true);
                } else {
                  router.back();
                }
              }}
              disabled={saving}
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={saving || !hasUnsavedChanges}
              className={`
    flex-1 rounded-2xl px-5 py-4 font-semibold transition

    ${
      saving || !hasUnsavedChanges
        ? "cursor-not-allowed bg-slate-300 text-slate-500"
        : "bg-violet-600 text-white hover:bg-violet-700"
    }
  `}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>
      <ProfilePhotoCropModal
        open={cropModalOpen}
        image={previewImage}
        onClose={() => setCropModalOpen(false)}
        onSave={handleCropSave}
      />

      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[30px] bg-white p-6">
            <h2 className="text-2xl font-bold">Discard Changes?</h2>

            <p className="mt-3 text-slate-500">
              You have unsaved changes. If you leave now, your changes will be
              lost.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 rounded-2xl border border-slate-300 py-3 font-semibold"
              >
                Keep Editing
              </button>

              <button
                onClick={() => router.back()}
                className="flex-1 rounded-2xl bg-red-600 py-3 font-semibold text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
