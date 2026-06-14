"use client";

import { useEffect, useState } from "react";

import { getResources, getResourceStats } from "@/services/resource.service";

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resourceResult = await getResources();

        setResources(resourceResult.data);

        const statsResult = await getResourceStats();

        setStats(statsResult.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">Resources</h3>

        <p className="mt-2 text-3xl font-bold">{stats?.totalResources || 0}</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">PDFs</h3>

        <p className="mt-2 text-3xl font-bold">{stats?.pdfs || 0}</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">Videos</h3>

        <p className="mt-2 text-3xl font-bold">{stats?.videos || 0}</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="text-sm text-slate-500">Published</h3>

        <p className="mt-2 text-3xl font-bold">{stats?.published || 0}</p>
      </div>

      <div className="space-y-4">

  {resources.map(
    (resource) => (
      <div
        key={resource.id}
        className="rounded-xl bg-white p-6 shadow"
      >
        <h2 className="text-xl font-semibold">
          {resource.title}
        </h2>

        <p className="mt-2 text-slate-500">
          {resource.type}
        </p>
      </div>
    )
  )}

</div>
    </div>
  );
}
