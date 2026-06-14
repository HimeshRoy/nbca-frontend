"use client";

import { useEffect, useState } from "react";

import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "@/services/class.service";

import { getBoards } from "@/services/board.service";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    boardId: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchBoards();
  }, []);

  const fetchClasses = async () => {
    try {
      const result = await getClasses();
      setClasses(result.data);
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

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      boardId: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateClass(editingId, formData);
      } else {
        await createClass(formData);
      }

      await fetchClasses();

      setShowModal(false);

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);

    setFormData({
      name: item.name,
      boardId: item.boardId,
    });

    setShowModal(true);
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this class?"
      );

    if (!confirmed) return;

    try {
      await deleteClass(id);

      await fetchClasses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Classes
          </h1>

          <p className="text-slate-500">
            Manage Classes
          </p>

        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Class
        </button>

      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Class Name
              </th>

              <th className="p-4 text-left">
                Board
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {classes.length === 0 ? (
              <tr>

                <td
                  colSpan={3}
                  className="p-6 text-center"
                >
                  No Classes Found
                </td>

              </tr>
            ) : (
              classes.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="p-4">
                    {item.name}
                  </td>

                  <td className="p-4">
                    {item.board?.name}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(item)
                        }
                        className="rounded bg-yellow-500 px-3 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
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

              {editingId
                ? "Edit Class"
                : "Create Class"}

            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Class Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <select title="board"
                value={formData.boardId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    boardId:
                      e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              >

                <option value="">
                  Select Board
                </option>

                {boards.map(
                  (board: any) => (
                    <option
                      key={board.id}
                      value={board.id}
                    >
                      {board.name}
                    </option>
                  )
                )}

              </select>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 rounded border py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded bg-blue-700 py-3 text-white"
                >
                  {editingId
                    ? "Update Class"
                    : "Create Class"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}