import Link from "next/link";
import Image from "next/image";
import TeacherLogoutButton from "@/components/ui/TeacherLogoutButton";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-white flex-col fixed left-0 top-0 rounded-br-3xl rounded-tr-3xl">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-4 rounded-2xl ">
              <Image src="/logo.png" alt="NBCA" width={60} height={60} />{" "}
              <h2 className="text-xl font-bold">NBCA Admin</h2>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/academic-sessions"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Academic Sessions
            </Link>

            <Link
              href="/admin/boards"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Boards
            </Link>

            <Link
              href="/admin/classes"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Classes
            </Link>

            <Link
              href="/admin/subjects"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Subjects
            </Link>

            <Link
              href="/admin/students"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Students
            </Link>

            <Link
              href="/admin/teachers"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Teachers
            </Link>

            <Link
              href="/admin/notices"
              className="block rounded-lg px-4 py-3 hover:bg-slate-800"
            >
              Notices
            </Link>
          </nav>
          <div className="relative bottom-5 p-8">
            <TeacherLogoutButton />
          </div>
        </aside>

        {/* Content */}
        <main className="ml-64 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
