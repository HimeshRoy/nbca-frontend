"use client";

import { useEffect, useState } from "react";

import {
  getAcademicSessions,
  createAcademicSession,
  deleteAcademicSession,
  updateAcademicSession,
} from "@/services/academic-session.service";

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateAcademicSession(editingId, formData);
      } else {
        await createAcademicSession(formData);
      }

      const result = await getAcademicSessions();

      setSessions(result.data);

      setShowModal(false);

      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const result = await getAcademicSessions();

        setSessions(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this session?");

    if (!confirmDelete) return;

    try {
      await deleteAcademicSession(id);

      const result = await getAcademicSessions();

      setSessions(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Sessions</h1>

          <p className="mt-1 text-slate-500">Manage academic years</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Session
        </button>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6">
              <h2 className="mb-4 text-2xl font-bold">
                Create Academic Session
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="2026-27"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                />

                <input
                  title="startdate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                />

                <input
                  title="enddate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                />

                <select
                  title="acitve-inactive"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded border p-3"
                >
                  <option value="ACTIVE">ACTIVE</option>

                  <option value="INACTIVE">INACTIVE</option>
                </select>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded border py-3"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    className="flex-1 rounded bg-blue-700 py-3 text-white"
                  >
                    {editingId ? "Update Session" : "Create Session"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Start Date</th>

              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  No Sessions Found
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="border-t">
                  <td className="p-4">{session.name}</td>

                  <td className="p-4">{session.status}</td>

                  <td className="p-4">
                    {new Date(session.startDate).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    {new Date(session.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                      className="rounded bg-yellow-500 px-3 py-1 text-white"
                        onClick={() => {
                          setEditingId(session.id);

                          setFormData({
                            name: session.name,
                            startDate: session.startDate.split("T")[0],

                            endDate: session.endDate.split("T")[0],

                            status: session.status,
                          });

                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(session.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
