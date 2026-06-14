export default function BoardsSection() {
  const boards = [
    {
      name: "CBSE",
      subtitle: "Central Board of Secondary Education",
      points: [
        "NCERT Based Learning",
        "Class 9 & 10 Support",
        "Board Exam Preparation",
      ],
    },
    {
      name: "ICSE",
      subtitle: "Indian Certificate of Secondary Education",
      points: [
        "Concept Focused Learning",
        "Detailed Subject Coverage",
        "Regular Assessments",
      ],
    },
    {
      name: "WBBSE",
      subtitle: "West Bengal Board of Secondary Education",
      points: [
        "Board Syllabus Coverage",
        "Exam Oriented Preparation",
        "Structured Learning",
      ],
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Boards We Support</h2>

          <p className="mt-4 text-gray-600">
            Dedicated preparation designed according to the curriculum and examination pattern of each board.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <h3 className="text-2xl font-bold text-blue-700">{board.name}</h3>

              <p className="mt-1 text-sm font-medium text-gray-500">
                {board.subtitle}
              </p>

              <div className="mt-5 space-y-2">
                {board.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="text-xl font-bold text-green-600">✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
