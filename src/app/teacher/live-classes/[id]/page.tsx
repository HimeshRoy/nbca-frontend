"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FaVideo,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaUserCheck,
  FaInfoCircle,
  FaCheckCircle,
  FaSignOutAlt
} from "react-icons/fa";

import {
  getLiveClassById,
  getLiveClassAttendance,
} from "@/services/live-class.service";

export default function LiveClassDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [liveClass, setLiveClass] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [classResult, attendanceResult] = await Promise.all([
          getLiveClassById(id),
          getLiveClassAttendance(id)
        ]);

        setLiveClass(classResult.data);
        setAttendance(attendanceResult.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400 text-4xl">
          <FaInfoCircle />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Class Not Found</h2>
        <p className="text-slate-500 mt-2">The live class you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const isUpcoming = new Date(liveClass.endTime) > new Date();

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-8">
  
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-lg">
                <FaVideo />
              </span>
              <h1 className="text-3xl font-bold text-slate-800 leading-tight">{liveClass.title}</h1>
            </div>
            
            <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
              {liveClass.description || "No description provided for this session."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700 border border-blue-100">
                <FaChalkboardTeacher /> {liveClass.class?.name}
              </span>
              <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-100">
                <FaBook /> {liveClass.subject?.name}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 max-w-2xl">
              <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-400">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(liveClass.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-slate-400">
                  <FaClock />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(liveClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {" - "} 
                    {new Date(liveClass.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
            <a
              href={liveClass.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg w-full text-center"
            >
              <FaVideo /> Join Meeting
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <FaUsers /> Attendance Records
          </p>
          <p className="text-3xl font-black text-slate-800">{attendance.length}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <FaUserCheck /> Present Students
          </p>
          <p className="text-3xl font-black text-blue-600">{attendance.length}</p>
        </div>

        <div className={`rounded-3xl p-6 border flex flex-col justify-center ${
          liveClass.isActive || isUpcoming 
            ? "bg-emerald-50 border-emerald-100" 
            : "bg-slate-50 border-slate-100"
        }`}>
          <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${
            liveClass.isActive || isUpcoming ? "text-emerald-600" : "text-slate-500"
          }`}>
            <FaInfoCircle /> Status
          </p>
          <p className={`text-2xl font-black ${
            liveClass.isActive || isUpcoming ? "text-emerald-700" : "text-slate-700"
          }`}>
            {liveClass.isActive ? "Active" : (isUpcoming ? "Scheduled" : "Completed")}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FaUsers className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Attendance Log</h2>
            <p className="text-sm text-slate-500">Students who joined this live session.</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-full mb-3 text-slate-400 text-2xl shadow-sm border border-slate-100">
              <FaSignOutAlt />
            </div>
            <p className="text-lg font-bold text-slate-700">No Students Joined Yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Attendance records will appear here automatically once students join the session.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendance.map((record: any) => (
              <div 
                key={record.id} 
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {record.student?.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{record.student?.name || "Unknown Student"}</p>
                    <p className="text-[11px] font-semibold text-slate-400 capitalize">{record.status || "Present"}</p>
                  </div>
                </div>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <FaCheckCircle className="text-sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}