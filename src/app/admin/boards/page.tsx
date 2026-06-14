"use client";

import { useEffect, useState } from "react";

import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from "@/services/board.service";

export default function BoardsPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  });

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const result = await getBoards();
      setBoards(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateBoard(editingId, formData);
      } else {
        await createBoard(formData);
      }

      await fetchBoards();

      setShowModal(false);
      setEditingId(null);

      setFormData({
        name: "",
        shortName: "",
        description: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (board: any) => {
    setEditingId(board.id);

    setFormData({
      name: board.name,
      shortName: board.shortName,
      description: board.description || "",
    });

    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this board?"
    );

    if (!confirmed) return;

    try {
      await deleteBoard(id);
      await fetchBoards();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Boards
          </h1>

          <p className="text-slate-500">
            Manage Education Boards
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);

            setFormData({
              name: "",
              shortName: "",
              description: "",
            });

            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-3 text-white"
        >
          Add Board
        </button>

      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Short Name
                </th>

                <th className="p-4 text-left">
                  Description
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {boards.length === 0 ? (
                <tr>

                  <td
                    colSpan={4}
                    className="p-6 text-center"
                  >
                    No Boards Found
                  </td>

                </tr>
              ) : (
                boards.map((board) => (
                  <tr
                    key={board.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      {board.name}
                    </td>

                    <td className="p-4">
                      {board.shortName}
                    </td>

                    <td className="p-4">
                      {board.description}
                    </td>

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleEdit(board)
                          }
                          className="rounded bg-yellow-500 px-3 py-1 text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(board.id)
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

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6">

            <h2 className="mb-4 text-2xl font-bold">

              {editingId
                ? "Edit Board"
                : "Create Board"}

            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Board Name"
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
                type="text"
                placeholder="Short Name"
                value={formData.shortName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shortName:
                      e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
                className="w-full rounded border p-3"
                rows={4}
              />

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
                    ? "Update Board"
                    : "Create Board"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}