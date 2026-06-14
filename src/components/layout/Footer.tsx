import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <h3 className="text-2xl font-bold">
              NBCA
            </h3>

            <p className="mt-4 text-slate-400">
              North Bengal Cloud Academy provides structured
              online learning for CBSE, ICSE and WBBSE students.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg">
              Quick Links
            </h4>

            <div className="mt-4 flex flex-col gap-2 text-slate-400">

              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/courses">Courses</Link>
              <Link href="/contact">Contact</Link>

            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg">
              Boards
            </h4>

            <div className="mt-4 flex flex-col gap-2 text-slate-400">

              <span>CBSE</span>
              <span>ICSE</span>
              <span>WBBSE</span>

            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg">
              Contact
            </h4>

            <div className="mt-4 flex flex-col gap-2 text-slate-400">

              <span>support@nbca.co.in</span>
              <span>Jalpaiguri, West Bengal</span>
              <span>Online Learning Platform</span>

            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © 2026 North Bengal Cloud Academy. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}