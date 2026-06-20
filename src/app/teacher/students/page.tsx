"use client";

import { useEffect, useState } from "react";

import { getStudents } from "@/services/student.service";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };

  const loadStudents = async () => {
    const result = await getStudents();

    setStudents(result.data || []);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-4 py-2"
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-slate-500">Total Students</p>

        <h2 className="text-3xl font-bold">{students.length}</h2>
      </div>

      <div className="rounded-xl bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Student ID</th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Email</th>

              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b">
                <td className="p-4">{student.studentId}</td>

                <td className="p-4">{student.name}</td>

                <td className="p-4">{student.email}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      student.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Student Profile</h2>

              <button onClick={() => setSelectedStudent(null)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">Student ID</p>

                <p>{selectedStudent.studentId}</p>
              </div>

              <div>
                <p className="text-slate-500">Name</p>

                <p>{selectedStudent.name}</p>
              </div>

              <div>
                <p className="text-slate-500">Email</p>

                <p>{selectedStudent.email}</p>
              </div>

              <div>
                <p className="text-slate-500">Phone</p>

                <p>{selectedStudent.phone}</p>
              </div>

              <div>
                <p className="text-slate-500">Guardian</p>

                <p>{selectedStudent.guardianName}</p>
              </div>

              <div>
                <p className="text-slate-500">Guardian Phone</p>

                <p>{selectedStudent.guardianPhone}</p>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">
                Academic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Board</p>

                  <p>{selectedStudent.board?.name || "-"}</p>
                </div>

                <div>
                  <p className="text-slate-500">Class</p>

                  <p>{selectedStudent.class?.name || "-"}</p>
                </div>

                <div>
                  <p className="text-slate-500">Admission Date</p>

                  <p>
                    {selectedStudent.admissionDate
                      ? new Date(
                          selectedStudent.admissionDate,
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>

                  <p>{selectedStudent.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
  <h3 className="mb-4 text-lg font-semibold">
    Activity Summary
  </h3>

  <div className="grid grid-cols-3 gap-4">

    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        Assignments
      </p>

      <p className="text-2xl font-bold">
        {selectedStudent.submissions?.length || 0}
      </p>
    </div>

    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        Attendance
      </p>

      <p className="text-2xl font-bold">
        {selectedStudent.attendances?.length || 0}
      </p>
    </div>

    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        Test Attempts
      </p>

      <p className="text-2xl font-bold">
        {selectedStudent.testAttempts?.length || 0}
      </p>
    </div>

  </div>
</div>
          </div>
        </div>
      )}
    </div>
  );
}
