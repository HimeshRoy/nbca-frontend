"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePhotoCropModal from "@/components/student/ProfilePhotoCropModal";
import {
  getMyProfile,
  updateMyProfile,
} from "@/services/studentProfile.service";
import { uploadFile } from "@/services/upload.service";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Camera,
  Save,
  X,
  Lock,
  AlertTriangle,
  UserCircle,
  MapPin,
} from "lucide-react";

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <DotLottieReact
            src="https://lottie.host/8cc70ce1-7bcb-4492-b978-77cde0aad40a/QnHc4gdlQq.lottie"
            loop
            autoplay
          />
        </div>
        <p className="mt-4 animate-pulse font-medium text-slate-500">
          Loading your profile...
        </p>
      </div>
    );
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
    setCropModalOpen(true);
    setForm((prev) => ({ ...prev, photo: file }));
  };

  const handleCropSave = (blob: Blob, preview: string) => {
    const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
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

      setProfile((prev: any) => ({ ...prev, ...payload }));
      if (payload.photo) setCurrentPhoto(payload.photo);
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
    <div className="min-h-screen p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-50 rounded-full blur-3xl opacity-50 -z-10" />

          <div className="flex flex-col items-center z-10">
            <div className="relative mb-6">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-600 text-4xl font-bold text-white shadow-lg">
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
                className={`absolute bottom-0 right-0 rounded-full p-3 text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${
                  photoChangesRemaining === 0
                    ? "cursor-not-allowed bg-slate-400"
                    : "cursor-pointer bg-violet-600 hover:bg-violet-700"
                }`}
              >
                <Camera size={18} />
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

            <h1 className="text-2xl font-extrabold text-slate-800">
              Update Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep your personal information up to date
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 border border-violet-100">
              {photoChangesRemaining === 0
                ? "No photo changes remaining"
                : photoChangesRemaining === 1
                  ? "Last photo change remaining"
                  : `${photoChangesRemaining} lifetime photo changes remaining`}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <UserCircle className="text-violet-500" /> Personal Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Gender
              </label>
              <select
                title="gender"
                value={form.gender}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <MapPin className="text-blue-500" /> Family & Address
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Address
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                placeholder="Enter your full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Enter guardian name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Enter guardian phone"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-inner md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              Academic Information
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Lock size={14} /> Read Only
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 opacity-80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Student ID
              </p>
              <p className="font-semibold text-slate-700">
                {academicInfo.studentId}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 opacity-80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Board
              </p>
              <p className="font-semibold text-slate-700">
                {academicInfo.board}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 opacity-80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Class
              </p>
              <p className="font-semibold text-slate-700">
                {academicInfo.className}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 opacity-80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Session
              </p>
              <p className="font-semibold text-slate-700">
                {academicInfo.session}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <AlertTriangle size={14} /> These details are managed by the academy
            and cannot be edited.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-4 sm:flex-row pt-4">
          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) setShowDiscardModal(true);
              else router.back();
            }}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={18} /> Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={saving || !hasUnsavedChanges}
            className={`
              flex-1 flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-bold transition-all
              ${
                saving || !hasUnsavedChanges
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                  : "bg-violet-600 text-white shadow-md hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200"
              }
            `}
          >
            <Save size={18} /> {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      <ProfilePhotoCropModal
        open={cropModalOpen}
        image={previewImage}
        onClose={() => setCropModalOpen(false)}
        onSave={handleCropSave}
      />

      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Discard Changes?
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              You have unsaved changes. If you leave now, your updates will be
              lost forever.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="w-full rounded-xl bg-slate-100 py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Keep Editing
              </button>
              <button
                onClick={() => router.back()}
                className="w-full rounded-xl bg-rose-600 py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
