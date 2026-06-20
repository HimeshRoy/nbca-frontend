"use client";

import { useEffect, useState } from "react";

import { getMyProfile, updateTeacherProfile } from "@/services/profile.service";
import { uploadFile } from "@/services/upload.service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

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

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.password !== passwordData.confirmPassword) {
        alert("Passwords do not match");

        return;
      }

      setPasswordSaving(true);

      await updateTeacherProfile(profile.id, {
        password: passwordData.password,
      });

      alert("Password updated successfully");

      setPasswordOpen(false);

      setPasswordData({
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);

      alert("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
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
    };

    loadProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>

        <p className="text-slate-500">Manage your account</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center gap-6">
          <img
            src={profile.photo || "/avatar.png"}
            alt="Teacher"
            className="h-24 w-24 rounded-full object-cover"
          />

          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>

            <p className="text-slate-500">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white mt-8 cursor-pointer"
        >
          Edit Profile
        </button>
        <button
          onClick={() => setPasswordOpen(true)}
          className="ml-3 rounded-lg bg-red-600 px-4 py-2 text-white cursor-pointer"
        >
          Change Password
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>

          <p>
            <strong>Phone:</strong> {profile.phone}
          </p>

          <p>
            <strong>Qualification:</strong> {profile.qualification}
          </p>

          <p>
            <strong>Experience:</strong> {profile.experience} Years
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Bio</h3>

          <p>{profile.bio || "No bio added"}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Assigned Classes</h3>

          <div className="flex flex-wrap gap-2">
            {profile.classes?.map((cls: any) => (
              <span
                key={cls.id}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {cls.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Assigned Subjects</h3>

          <div className="flex flex-wrap gap-2">
            {profile.subjects?.map((subject: any) => (
              <span
                key={subject.id}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                {subject.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Account Information</h3>

          <p>
            <strong>Status:</strong> {profile.isActive ? "Active" : "Inactive"}
          </p>

          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-xl rounded-xl bg-white p-6">
            <div className="mb-6 flex flex-col items-center">
              <img
                src={photoPreview || "/avatar.png"}
                alt="Preview"
                className="h-32 w-32 rounded-full border object-cover"
              />

              <label
                htmlFor="teacher-photo"
                className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Change Photo
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
            <h2 className="mb-4 text-2xl font-bold">Edit Profile</h2>

            <div className="space-y-4">
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Name"
                className="w-full rounded border p-3"
              />

              <input
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
                className="w-full rounded border p-3"
              />

              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone"
                className="w-full rounded border p-3"
              />

              <input
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualification: e.target.value,
                  })
                }
                placeholder="Qualification"
                className="w-full rounded border p-3"
              />

              <input
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: Number(e.target.value),
                  })
                }
                placeholder="Experience"
                className="w-full rounded border p-3"
              />

              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bio: e.target.value,
                  })
                }
                placeholder="Bio"
                className="w-full rounded border p-3"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={handleUpdateProfile}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Change Password</h2>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPasswordOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className="rounded bg-red-600 px-4 py-2 text-white"
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
