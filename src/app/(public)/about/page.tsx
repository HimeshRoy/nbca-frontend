import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-linear-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
            About NBCA
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            North Bengal Cloud Academy is an online learning platform dedicated
            to helping students succeed through quality education, structured
            learning and expert guidance.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-blue-700">Our Mission</h2>

            <p className="mt-4 text-gray-600 leading-relaxed">
              To make quality education accessible, affordable and engaging
              through technology-driven learning experiences that help students
              achieve their academic goals.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-blue-700">Our Vision</h2>

            <p className="mt-4 text-gray-600 leading-relaxed">
              To become a trusted learning platform that empowers students with
              knowledge, confidence and skills for lifelong success.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Our Story</h2>
          </div>

          <p className="mt-8 text-lg text-gray-600 leading-relaxed text-center">
            North Bengal Cloud Academy was created with a simple goal: make
            quality education accessible to students through structured online
            learning. We focus on board-based education for CBSE, ICSE and WBBSE
            students, helping them learn English, Mathematics and Science
            through live classes, study materials, assignments and assessments.
          </p>
        </div>
      </section>

      {/* Boards */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Boards We Support</h2>

            <p className="mt-4 text-gray-600">
              Learning designed according to board-specific curriculum.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700">CBSE</h3>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700">ICSE</h3>
            </div>

            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700">WBBSE</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Why Learn With NBCA?</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Live Classes</h3>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Study Materials</h3>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Assignments</h3>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Online Tests</h3>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Performance Tracking</h3>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-xl font-semibold text-center">Teacher Guidance</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold">Subjects We Teach</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-2xl font-bold text-blue-700">English</h3>

              <p className="mt-3 text-gray-600">
                Grammar, writing, comprehension and board preparation.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-2xl font-bold text-blue-700">Mathematics</h3>

              <p className="mt-3 text-gray-600">
                Concept building, practice and problem solving.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-400 p-6">
              <h3 className="text-2xl font-bold text-blue-700">Science</h3>

              <p className="mt-3 text-gray-600">
                Physics, Chemistry and Biology with clarity and depth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready To Start Learning?
          </h2>

          <p className="mt-4 text-blue-100">
            Join NBCA and take the next step in your learning journey.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-700"
            >
              Enroll Now
            </Link>

            <Link
              href="/contact"
              className="rounded-xl border border-white px-6 py-3 font-semibold text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
