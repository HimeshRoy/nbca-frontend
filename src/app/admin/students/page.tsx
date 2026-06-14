"use client";

import { useEffect, useState } from "react";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/services/student.service";

import { getBoards } from "@/services/board.service";
import { getClasses } from "@/services/class.service";
import { getAcademicSessions } from "@/services/academic-session.service";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedBoard, setSelectedBoard] = useState("");

  const [selectedClass, setSelectedClass] = useState("");

  const [selectedSession, setSelectedSession] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
    boardId: "",
    classId: "",
    academicSessionId: "",
    isActive: true,
  });

  const fetchBoards = async () => {
    const result = await getBoards();
    setBoards(result.data);
  };

  const fetchClasses = async () => {
    const result = await getClasses();
    setClasses(result.data);
  };

  const fetchSessions = async () => {
    const result = await getAcademicSessions();

    setSessions(result.data);
  };
  const fetchStudents = async () => {
    try {
      const result = await getStudents();

      setStudents(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredClasses = formData.boardId
    ? classes.filter((item: any) => item.boardId === formData.boardId)
    : [];

  useEffect(() => {
    fetchStudents();
    fetchBoards();
    fetchClasses();
    fetchSessions();
  }, []);

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesBoard = !selectedBoard || student.boardId === selectedBoard;

    const matchesClass = !selectedClass || student.classId === selectedClass;

    const matchesSession =
      !selectedSession || student.academicSessionId === selectedSession;

    const matchesStatus =
      selectedStatus === ""
        ? true
        : student.isActive === (selectedStatus === "active");

    return (
      matchesSearch &&
      matchesBoard &&
      matchesClass &&
      matchesSession &&
      matchesStatus
    );
  });

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this student?");

    if (!confirmed) return;

    try {
      await deleteStudent(id);

      await fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateStudent(editingId, formData);
      } else {
        await createStudent(formData);
      }

      await fetchStudents();

      setShowModal(false);

      setEditingId(null);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        gender: "",
        guardianName: "",
        guardianPhone: "",
        address: "",
        boardId: "",
        classId: "",
        academicSessionId: "",
        isActive: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (student: any) => {
    setEditingId(student.id);

    setFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      password: "",

      gender: student.gender || "",

      guardianName: student.guardianName || "",

      guardianPhone: student.guardianPhone || "",

      address: student.address || "",

      boardId: student.boardId || "",

      classId: student.classId || "",

      academicSessionId: student.academicSessionId || "",

      isActive: student.isActive,
    });

    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>

          <p className="text-slate-500">Manage Students</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Student
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name, Student ID, Email or Phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <select
          title="board"
          value={selectedBoard}
          onChange={(e) => setSelectedBoard(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Boards</option>

          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>

        <select
          title="class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Classes</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.board?.name})
            </option>
          ))}
        </select>

        <select
          title="session"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Sessions</option>

          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>

        <select
          title="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Status</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Student ID</th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Board</th>

              <th className="p-4 text-left">Class</th>

              <th className="p-4 text-left">Session</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  No Students Found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-4">{student.studentId}</td>

                  <td className="p-4">{student.name}</td>

                  <td className="p-4">{student.board?.name}</td>

                  <td className="p-4">{student.class?.name}</td>

                  <td className="p-4">{student.academicSession?.name}</td>

                  <td className="p-4">
                    {student.isActive ? "Active" : "Inactive"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="mr-2 rounded bg-yellow-500 px-3 py-1 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId ? "Edit Student" : "Add Student"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <select
                title="gander"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value,
                  })
                }
                className="rounded border p-3"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Guardian Name"
                value={formData.guardianName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guardianName: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="text"
                placeholder="Guardian Phone"
                value={formData.guardianPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guardianPhone: e.target.value,
                  })
                }
                className="rounded border p-3"
              />
            </div>

            <textarea
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              className="mt-4 w-full rounded border p-3"
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
              className="mt-4 w-full rounded border p-3"
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
              className="mt-4 w-full rounded border p-3"
            >
              <option value="">Select Class</option>

              {filteredClasses.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              title="session"
              value={formData.academicSessionId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  academicSessionId: e.target.value,
                })
              }
              className="mt-4 w-full rounded border p-3"
            >
              <option value="">Select Session</option>

              {sessions.map((session: any) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>

            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.checked,
                  })
                }
              />
              Active Student
            </label>

            <div className="mt-6 flex gap-3">
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
                {editingId ? "Update Student" : "Create Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
