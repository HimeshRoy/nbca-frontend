"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getLiveClassById,
  getLiveClassAttendance,
} from "@/services/live-class.service";

export default function liveClassDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const [liveClass, setLiveClass] = useState<any>(null);

  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classResult = await getLiveClassById(id);

        setLiveClass(classResult.data);

        const attendanceResult = await getLiveClassAttendance(id);

        setAttendance(attendanceResult.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!liveClass) {
    return <div className="p-6">Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">{liveClass.title}</h1>

        <p className="mt-3 text-slate-600">{liveClass.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            {liveClass.class?.name}
          </span>

          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            {liveClass.subject?.name}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p>Start: {new Date(liveClass.startTime).toLocaleString()}</p>

          <p>End: {new Date(liveClass.endTime).toLocaleString()}</p>
        </div>

        <a
          href={liveClass.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Join Meeting
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Attendance Records</h3>

          <p className="mt-2 text-3xl font-bold">{attendance.length}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Present Students</h3>

          <p className="mt-2 text-3xl font-bold">{attendance.length}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-slate-500">Status</h3>

          <p className="mt-2 text-xl font-bold">
            {liveClass.isActive ? "Active" : "Completed"}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Attendance</h2>

        {attendance.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            No students have joined yet.
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.map((record: any) => (
              <div key={record.id} className="rounded-lg border p-4">
                <p className="font-semibold">{record.student?.name}</p>

                <p className="text-sm text-slate-500">{record.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
