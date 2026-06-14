"use client";

import { useEffect, useState } from "react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/subject.service";

import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    boardId: "",
    classId: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchBoards();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    try {
      const result = await getSubjects();

      setSubjects(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBoards = async () => {
    try {
      const result = await getBoards();

      setBoards(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await getClasses();

      setClasses(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      boardId: "",
      classId: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateSubject(editingId, formData);
      } else {
        await createSubject(formData);
      }

      await fetchSubjects();

      setShowModal(false);

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (subject: any) => {
    setEditingId(subject.id);

    setFormData({
      name: subject.name,
      boardId: subject.boardId,
      classId: subject.classId,
    });

    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this subject?");

    if (!confirmed) return;

    try {
      await deleteSubject(id);

      await fetchSubjects();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredClasses = formData.boardId
    ? classes.filter((item) => item.boardId === formData.boardId)
    : classes;

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>

          <p className="text-slate-500">Manage Subjects</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Subject
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Subject</th>

              <th className="p-4 text-left">Board</th>

              <th className="p-4 text-left">Class</th>

              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  No Subjects Found
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id} className="border-t">
                  <td className="p-4">{subject.name}</td>

                  <td className="p-4">{subject.board?.name}</td>

                  <td className="p-4">{subject.class?.name}</td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="rounded bg-yellow-500 px-3 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(subject.id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {editingId ? "Edit Subject" : "Create Subject"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <select
                title="board"
                value={formData.boardId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    boardId: e.target.value,
                    classId: "",
                  })
                }
                className="w-full rounded border p-3"
              >
                <option value="">Select Board</option>

                {boards.map((board: any) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>

              <select
                title="class"
                value={formData.classId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              >
                <option value="">Select Class</option>

                {filteredClasses.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
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
                  {editingId ? "Update Subject" : "Create Subject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
