"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaUserGraduate,
  FaTimes,
  FaEnvelope,
  FaPhoneAlt,
  FaIdCard,
  FaUserTie,
  FaUniversity,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaBook,
  FaClipboardCheck,
  FaVial,
  FaEye
} from "react-icons/fa";

import { getStudents } from "@/services/student.service";
import { getMyProfile } from "@/services/teacher.service";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };

  const loadData = async () => {
    try {
      setIsFetching(true);
      
      const [teacherResult, studentsResult] = await Promise.all([
        getMyProfile(),
        getStudents()
      ]);

      const allStudents = studentsResult.data || [];
      const teacherProfile = teacherResult.data;

      const assignedClassIds = teacherProfile?.classes?.map((cls: any) => cls.id) || [];

      const assignedStudents = allStudents.filter((student: any) => {
        const studentClassId = student.class?.id || student.classId;
        return assignedClassIds.includes(studentClassId);
      });

      setStudents(assignedStudents);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load students");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()),
  );

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading assigned students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">
 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Students Directory</h1>
          <p className="mt-1 text-slate-500">View and manage your assigned students.</p>
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <p className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
            <FaUserGraduate /> Total Assigned
          </p>
          <p className="text-4xl font-black text-blue-700">{students.length}</p>
        </div>
      </div>


      <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-5 bg-slate-50 rounded-full mb-4 text-slate-400 text-3xl">
              <FaSearch />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No students found</h3>
            <p className="mt-2 text-slate-500 max-w-md">You may not have any students assigned yet, or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm font-semibold tracking-wide">
                  <th className="p-5">Student ID</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Class & Board</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="transition-colors hover:bg-slate-50/50 group">
                    <td className="p-5 text-sm font-medium text-slate-700">
                      {student.studentId}
                    </td>
                    <td className="p-5 text-sm font-bold text-slate-800">
                      {student.name}
                    </td>
                    <td className="p-5 text-sm text-slate-500">
                      <span className="block font-semibold text-slate-700">{student.class?.name || "N/A"}</span>
                      <span className="text-xs">{student.board?.name || "N/A"}</span>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${
                          student.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
   
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full opacity-50 -z-0"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md border-4 border-white">
                  <FaUserGraduate />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.name}</h2>
                  <span className={`inline-flex items-center mt-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      selectedStudent.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {selectedStudent.isActive ? "Currently Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="relative z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FaIdCard />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedStudent.studentId || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedStudent.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedStudent.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FaUserTie />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guardian</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {selectedStudent.guardianName || "N/A"} 
                      {selectedStudent.guardianPhone && <span className="text-slate-500 font-normal"> • {selectedStudent.guardianPhone}</span>}
                    </p>
                  </div>
                </div>
              </div>


              <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50">
                <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">Academic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-indigo-500 shadow-sm">
                      <FaUniversity />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Board</p>
                      <p className="text-sm font-bold text-slate-800">{selectedStudent.board?.name || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm">
                      <FaChalkboardTeacher />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Class</p>
                      <p className="text-sm font-bold text-slate-800">{selectedStudent.class?.name || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Admission Date</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedStudent.admissionDate
                          ? new Date(selectedStudent.admissionDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">Activity Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl">
                      <FaBook />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assignments</p>
                      <p className="text-2xl font-black text-slate-800">{selectedStudent.submissions?.length || 0}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4 shadow-sm hover:border-emerald-200 transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl">
                      <FaClipboardCheck />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Attendance</p>
                      <p className="text-2xl font-black text-slate-800">{selectedStudent.attendances?.length || 0}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl">
                      <FaVial />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Test Attempts</p>
                      <p className="text-2xl font-black text-slate-800">{selectedStudent.testAttempts?.length || 0}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}