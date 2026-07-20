"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaUserEdit,
  FaLock,
  FaEnvelope,
  FaPhoneAlt,
  FaGraduationCap,
  FaBriefcase,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimes,
  FaCamera,
  FaTimesCircle
} from "react-icons/fa";

import { getMyProfile, updateTeacherProfile } from "@/services/profile.service";
import { uploadFile } from "@/services/upload.service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: 0,
    bio: "",
  });

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      let photo = profile.photo;

      if (photoFile) {
        const upload = await uploadFile(photoFile);
        photo = upload.data.fileUrl;
      }

      await updateTeacherProfile(profile.id, {
        ...formData,
        photo,
      });

      const updated = await getMyProfile();
      setProfile(updated.data);
      setOpen(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.password !== passwordData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setPasswordSaving(true);
      await updateTeacherProfile(profile.id, {
        password: passwordData.password,
      });

      toast.success("Password updated successfully");
      setPasswordOpen(false);
      setPasswordData({
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsFetching(true);
        const result = await getMyProfile();
        setProfile(result.data);
        setPhotoPreview(result.data.photo || "");
        setFormData({
          name: result.data.name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          qualification: result.data.qualification || "",
          experience: result.data.experience || 0,
          bio: result.data.bio || "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile data");
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile();
  }, []);

  if (isFetching || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-1 text-slate-500">Manage your personal information and account settings.</p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {/* Cover Gradient */}
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        <div className="px-6 sm:px-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative inline-block">
                <img
                  src={profile.photo || "/avatar.png"}
                  alt="Teacher Profile"
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white object-cover bg-white shadow-md"
                />
                {profile.isActive && (
                  <div className="absolute bottom-2 right-0 bg-white rounded-full p-1 shadow-sm">
                    <FaCheckCircle className="text-emerald-500 text-xl" title="Active Account" />
                  </div>
                )}
              </div>
              <div className="mb-2">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
                <p className="flex items-center gap-2 text-slate-500 mt-1 font-medium">
                  <FaEnvelope className="text-slate-400" /> {profile.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600"
              >
                <FaUserEdit /> Edit Profile
              </button>
              <button
                onClick={() => setPasswordOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white border border-rose-100 hover:border-rose-600"
              >
                <FaLock /> Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
   
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h3 className="mb-6 text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Personal Details
          </h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <FaPhoneAlt />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="font-bold text-slate-700 mt-0.5">{profile.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <FaGraduationCap />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualification</p>
                <p className="font-bold text-slate-700 mt-0.5">{profile.qualification || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <FaBriefcase />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</p>
                <p className="font-bold text-slate-700 mt-0.5">{profile.experience ? `${profile.experience} Years` : "0 Years"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="flex-1 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              About Me
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {profile.bio || <span className="italic text-slate-400">No bio added yet. Click 'Edit Profile' to add one.</span>}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</span>
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                profile.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                {profile.isActive ? <><FaCheckCircle /> Active</> : <><FaTimesCircle /> Inactive</>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</span>
              <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <FaCalendarAlt className="text-slate-400 text-xs" />
                {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h3 className="mb-6 text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Academic Assignments
          </h3>
          
          <div className="mb-6">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <FaChalkboardTeacher /> Assigned Classes
            </p>
            {profile.classes && profile.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.classes.map((cls: any) => (
                  <span key={cls.id} className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {cls.name} {cls.board?.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No classes assigned yet.</p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <FaBook /> Assigned Subjects
            </p>
            {profile.subjects && profile.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((subject: any) => (
                  <span key={subject.id} className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
                    {subject.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No subjects assigned yet.</p>
            )}
          </div>
        </div>

      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                <p className="text-xs text-slate-500 mt-1">Update your personal information.</p>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8 flex flex-col items-center">
                <div className="grid grid-cols-2 w-full">
                <div className="relative group rounded-full overflow-hidden h-28 w-28 border-4 border-slate-100 shadow-sm">
                  <img
                    src={photoPreview || "/avatar.png"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <label
                    htmlFor="teacher-photo"
                    className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  >
                    <FaCamera className="text-2xl mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  </label>
                  <input
                    id="teacher-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
                <div className="w-full space-y-4">
                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                </div>
              </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Qualification</label>
                  <input
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., M.Sc in Mathematics"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    placeholder="Years of experience"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us a little about yourself..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-8 py-5 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleUpdateProfile}
                className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="bg-rose-50 border-b border-rose-100 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-rose-800">Change Password</h2>
                <p className="text-xs text-rose-600/70 mt-1">Ensure your account stays secure.</p>
              </div>
              <button 
                onClick={() => setPasswordOpen(false)}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-colors bg-white shadow-sm"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-8 py-5 flex justify-end gap-3">
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={passwordSaving || !passwordData.password}
                onClick={handleChangePassword}
                className="rounded-xl bg-rose-600 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}