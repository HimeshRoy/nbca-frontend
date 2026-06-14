"use client";

import { useEffect, useState } from "react";

import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "@/services/notice.service";

export default function NoticesPage() {
  const [notices, setNotices] =
    useState<any[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      audience: "ALL",
    });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices =
    async () => {
      try {
        const result =
          await getNotices();

        setNotices(
          result.data
        );
      } catch (error) {
        console.error(error);
      }
    };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      description: "",
      audience: "ALL",
    });
  };

  const handleSubmit =
    async () => {
      try {
        if (editingId) {
          await updateNotice(
            editingId,
            formData
          );
        } else {
          await createNotice(
            formData
          );
        }

        await fetchNotices();

        setShowModal(false);

        resetForm();

      } catch (error) {
        console.error(error);
      }
    };

  const handleEdit = (
    notice: any
  ) => {

    setEditingId(
      notice.id
    );

    setFormData({
      title:
        notice.title || "",

      description:
        notice.description ||
        "",

      audience:
        notice.audience ||
        "ALL",
    });

    setShowModal(true);
  };

  const handleDelete =
    async (
      id: string
    ) => {

      const confirmed =
        window.confirm(
          "Delete this notice?"
        );

      if (!confirmed)
        return;

      try {
        await deleteNotice(
          id
        );

        await fetchNotices();

      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="p-6">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Notices
          </h1>

          <p className="text-slate-500">
            Manage Notices
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Notice
        </button>

      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Audience
              </th>

              <th className="p-4 text-left">
                Created By
              </th>

              <th className="p-4 text-left">
                Created At
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {notices.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  No Notices Found
                </td>
              </tr>
            ) : (
              notices.map(
                (notice) => (
                  <tr
                    key={
                      notice.id
                    }
                    className="border-t"
                  >

                    <td className="p-4">
                      {
                        notice.title
                      }
                    </td>

                    <td className="p-4">
                      {
                        notice.audience
                      }
                    </td>

                    <td className="p-4">
                      {
                        notice.createdBy
                      }
                    </td>

                    <td className="p-4">
                      {new Date(
                        notice.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleEdit(
                              notice
                            )
                          }
                          className="rounded bg-yellow-500 px-3 py-1 text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              notice.id
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-xl bg-white p-6">

            <h2 className="mb-6 text-2xl font-bold">

              {editingId
                ? "Edit Notice"
                : "Add Notice"}

            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Notice Title"
                value={
                  formData.title
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <textarea
                placeholder="Notice Description"
                rows={5}
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <select title="audicance"
                value={
                  formData.audience
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    audience:
                      e.target
                        .value,
                  })
                }
                className="w-full rounded border p-3"
              >
                <option value="ALL">
                  ALL
                </option>

                <option value="STUDENTS">
                  STUDENTS
                </option>

                <option value="TEACHERS">
                  TEACHERS
                </option>
              </select>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                className="flex-1 rounded border py-3"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSubmit
                }
                className="flex-1 rounded bg-blue-700 py-3 text-white"
              >
                {editingId
                  ? "Update Notice"
                  : "Create Notice"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}