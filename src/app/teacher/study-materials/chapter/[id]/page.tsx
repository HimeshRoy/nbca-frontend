"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getChapterById } from "@/services/chapter.service";
import {
  createContent,
  getContentsByChapter,
  updateContent,
  deleteContent,
} from "@/services/content.service";

import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  uploadResourceFile,
} from "@/services/resource.service";

export default function ChapterDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [chapter, setChapter] = useState<any>(null);

  const [contents, setContents] = useState<any[]>([]);

  const [contentOpen, setContentOpen] = useState(false);

  const [editingContent, setEditingContent] = useState<any>(null);

  const [editingResource, setEditingResource] = useState<any>(null);

  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    orderNo: 1,
  });

  const [resourceOpen, setResourceOpen] = useState(false);

  const [selectedContent, setSelectedContent] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    youtubeUrl: "",
  });

  const getResourceBadge = (type: string) => {
    switch (type) {
      case "PDF":
        return "📄 PDF";

      case "VIDEO":
        return "🎥 VIDEO";

      case "PPT":
        return "📊 PPT";

      case "DOC":
        return "📘 DOC";

      case "IMAGE":
        return "🖼 IMAGE";

      case "EXCEL":
        return "📈 EXCEL";

      default:
        return type;
    }
  };

  const [resources, setResources] = useState<any[]>([]);

  const handleSaveContent = async () => {
    try {
      if (editingContent) {
        await updateContent(editingContent.id, {
          title: contentForm.title,

          description: contentForm.description,

          orderNo: contentForm.orderNo,
        });
      } else {
        await createContent({
          title: contentForm.title,

          description: contentForm.description,

          orderNo: contentForm.orderNo,

          chapterId: id,
        });
      }

      const result = await getContentsByChapter(id);

      setContents(result.data);

      setEditingContent(null);

      setContentForm({
        title: "",
        description: "",
        orderNo: 1,
      });

      setContentOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveResource = async () => {
    try {
      let fileUrl = "";

      if (selectedFile && resourceForm.type !== "LINK") {
        const uploadResult = await uploadResourceFile(selectedFile);

        fileUrl = uploadResult.data.fileUrl;
      }

      if (editingResource) {
        await updateResource(editingResource.id, {
          title: resourceForm.title,

          type: resourceForm.type,

          fileUrl: fileUrl || editingResource.fileUrl,

          youtubeUrl: resourceForm.youtubeUrl,
        });
      } else {
        await createResource({
          title: resourceForm.title,

          type: resourceForm.type,

          fileUrl,

          youtubeUrl:
            resourceForm.type === "LINK" ? resourceForm.youtubeUrl : "",

          contentId: selectedContent.id,
        });
      }

      const result = await getResources();

      setResources(result.data);

      setEditingResource(null);

      setSelectedFile(null);

      setResourceForm({
        title: "",
        type: "PDF",
        youtubeUrl: "",
      });

      setResourceOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    const confirmed = window.confirm("Delete content?");

    if (!confirmed) return;

    try {
      await deleteContent(contentId);

      const result = await getContentsByChapter(id);

      setContents(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = window.confirm("Delete resource?");

    if (!confirmed) return;

    try {
      await deleteResource(resourceId);

      const result = await getResources();

      setResources(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chapterResult = await getChapterById(id);

        setChapter(chapterResult.data);

        const contentsResult = await getContentsByChapter(id);

        setContents(contentsResult.data);

        const resourcesResult = await getResources();

        setResources(resourcesResult.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!chapter) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">{chapter.name}</h1>

        <p className="mt-3 text-slate-500">{chapter.description}</p>

        <div className="mt-4 flex gap-4">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            Chapter {chapter.chapterNo}
          </span>

          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            {contents.length} Contents
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setContentOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Add Content
        </button>
      </div>

      <div className="space-y-4">
        {contents.map((content) => {
          const contentResources = resources.filter(
            (resource) => resource.contentId === content.id,
          );
          return (
            <div key={content.id} className="rounded-xl bg-white p-6 shadow">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{content.title}</h2>

                  <p className="mt-2 text-slate-500">{content.description}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedContent(content);

                      setResourceOpen(true);
                    }}
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                  >
                    Add Resource
                  </button>

                  <button
                    onClick={() => {
                      setEditingContent(content);

                      setContentForm({
                        title: content.title,

                        description: content.description || "",

                        orderNo: content.orderNo || 1,
                      });

                      setContentOpen(true);
                    }}
                    className="rounded bg-amber-500 px-3 py-2 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteContent(content.id)}
                    className="rounded bg-red-600 px-3 py-2 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {contentResources.map((resource) => (
                  <div key={resource.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{resource.title}</p>

                        <p className="text-xs text-slate-500">
                          {getResourceBadge(resource.type)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {resource.fileUrl && (
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 p-2 text-white rounded-xl"
                          >
                            Open
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setEditingResource(resource);

                            setResourceForm({
                              title: resource.title,

                              type: resource.type,

                              youtubeUrl: resource.youtubeUrl || "",
                            });

                            setResourceOpen(true);
                          }}
                          className="rounded-xl bg-amber-500 p-2 text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="rounded-xl bg-red-600 p-2 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {contentResources.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No resources added yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {contentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Add Content</h2>

            <div className="space-y-4">
              <input
                placeholder="Content Title"
                className="w-full rounded border p-3"
                value={contentForm.title}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full rounded border p-3"
                value={contentForm.description}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Order No"
                className="w-full rounded border p-3"
                value={contentForm.orderNo}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    orderNo: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setContentOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveContent}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {editingContent ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {editingResource ? "Edit Resource" : "Add Resource"}
            </h2>

            <div className="space-y-4">
              <input
                placeholder="Resource Title"
                className="w-full rounded border p-3"
                value={resourceForm.title}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    title: e.target.value,
                  })
                }
              />

              <select
                title="Resource Type"
                className="w-full rounded border p-3"
                value={resourceForm.type}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    type: e.target.value,
                  })
                }
              >
                <option value="PDF">PDF</option>

                <option value="IMAGE">IMAGE</option>

                <option value="VIDEO">VIDEO</option>

                <option value="PPT">PPT</option>

                <option value="EXCEL">EXCEL</option>

                <option value="DOC">DOC</option>

                <option value="ASSIGNMENT">ASSIGNMENT</option>

                <option value="LINK">YouTube Link</option>
              </select>

              {resourceForm.type === "LINK" ? (
                <input
                  placeholder="YouTube URL"
                  className="w-full rounded border p-3"
                  value={resourceForm.youtubeUrl}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      youtubeUrl: e.target.value,
                    })
                  }
                />
              ) : (
                <input
                  title="file"
                  type="file"
                  className="w-full rounded border p-3"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setResourceOpen(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveResource}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {editingResource ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
