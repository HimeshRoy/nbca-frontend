import Link from "next/link";
import Image from "next/image";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-white flex-col fixed left-0 top-0">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-4 rounded-2xl ">
            <Image src="/logo.png" alt="NBCA" width={40} height={40} />{" "}
            <h2 className="text-xl font-bold">NBCA Teacher</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <Link
            href="/teacher"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <Link
            href="/teacher/assignments"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Assignments
          </Link>

          <Link
            href="/teacher/tests"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Tests
          </Link>
          <Link
            href="/teacher/question-bank"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Question Bank
          </Link>

          <Link
            href="/teacher/live-classes"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Live Classes
          </Link>

          <Link
            href="/teacher/study-materials"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Study Materials
          </Link>

          <Link
            href="/teacher/attendance"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Attendance
          </Link>

          <Link
            href="/teacher/students"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Students
          </Link>

          <Link
            href="/teacher/notices"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Notices
          </Link>

          <Link
            href="/teacher/profile"
            className="block rounded-lg px-4 py-3 hover:bg-slate-800"
          >
            Profile
          </Link>
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}
