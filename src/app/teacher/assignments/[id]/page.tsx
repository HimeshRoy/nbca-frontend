"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { deleteAssignment } from "@/services/assignment.service";
import { getAssignmentById } from "@/services/assignment.service";

export default function AssignmentDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const router = useRouter();

  const [assignment, setAssignment] = useState<any>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?",
    );

    if (!confirmed) return;

    try {
      await deleteAssignment(assignment.id);

      alert("Assignment deleted successfully");

      router.push("/teacher/assignments");
    } catch (error) {
      console.error(error);

      alert("Failed to delete assignment");
    }
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      const result = await getAssignmentById(id);

      setAssignment(result.data);
    };

    fetchAssignment();
  }, [id]);

  if (!assignment) {
    return <div className="p-6">Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        <p className="mt-3 text-slate-600">{assignment.description}</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {assignment.class?.name}
            </span>

            <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
              {assignment.class?.board?.name}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              {assignment.subject?.name}
            </span>
          </div>

          <p className="text-lg">Max Marks: {assignment.maxMarks}</p>

          <p className="text-lg">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-4 items-center mt-8">
          <div>
            {assignment.fileUrl && (
              <a
                href={assignment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                View Assignment File
              </a>
            )}
          </div>
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-white">
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Submissions</h2>

        {assignment.submissions?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <h3 className="text-lg font-semibold">No Submissions Yet</h3>

            <p className="mt-2 text-slate-500">
              Students have not submitted this assignment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignment.submissions?.map((submission: any) => (
              <div className="space-y-4" key={null}>
                {assignment.submissions?.map((submission: any) => (
                  <div key={submission.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {submission.student?.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Submitted:{" "}
                          {new Date(
                            submission.submittedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {submission.fileUrl && (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                          >
                            View Submission
                          </a>
                        )}

                        <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm">
                          Marks: {submission.marks ?? "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
