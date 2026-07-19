"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaBookOpen,
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaVideo,
  FaFilePowerpoint,
  FaFileWord,
  FaImage,
  FaFileExcel,
  FaLink,
  FaFileAlt,
  FaTimes,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaCog
} from "react-icons/fa";

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
  const [resources, setResources] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingResource, setIsSavingResource] = useState(false);

  const [contentOpen, setContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    orderNo: 1,
  });

  const [resourceOpen, setResourceOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    youtubeUrl: "",
  });

  const getResourceBadge = (type: string) => {
    switch (type) {
      case "PDF":
        return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaFilePdf /> PDF</span>;
      case "VIDEO":
        return <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 border border-purple-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaVideo /> Video</span>;
      case "PPT":
        return <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaFilePowerpoint /> PPT</span>;
      case "DOC":
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaFileWord /> DOC</span>;
      case "IMAGE":
        return <span className="flex items-center gap-1.5 text-teal-600 bg-teal-50 border border-teal-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaImage /> Image</span>;
      case "EXCEL":
        return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaFileExcel /> Excel</span>;
      case "LINK":
        return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaLink /> Link</span>;
      default:
        return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"><FaFileAlt /> {type}</span>;
    }
  };

  const handleSaveContent = async () => {
    try {
      setIsSavingContent(true);
      if (editingContent) {
        await updateContent(editingContent.id, {
          title: contentForm.title,
          description: contentForm.description,
          orderNo: contentForm.orderNo,
        });
        toast.success("Content updated successfully");
      } else {
        await createContent({
          title: contentForm.title,
          description: contentForm.description,
          orderNo: contentForm.orderNo,
          chapterId: id,
        });
        toast.success("Content added successfully");
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
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save content");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveResource = async () => {
    try {
      setIsSavingResource(true);
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
        toast.success("Resource updated successfully");
      } else {
        await createResource({
          title: resourceForm.title,
          type: resourceForm.type,
          fileUrl,
          youtubeUrl: resourceForm.type === "LINK" ? resourceForm.youtubeUrl : "",
          contentId: selectedContent.id,
        });
        toast.success("Resource added successfully");
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
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save resource");
    } finally {
      setIsSavingResource(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this content?");
    if (!confirmed) return;

    try {
      await deleteContent(contentId);
      const result = await getContentsByChapter(id);
      setContents(result.data);
      toast.success("Content deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete content");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    try {
      await deleteResource(resourceId);
      const result = await getResources();
      setResources(result.data);
      toast.success("Resource deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete resource");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [chapterResult, contentsResult, resourcesResult] = await Promise.all([
          getChapterById(id),
          getContentsByChapter(id),
          getResources()
        ]);

        setChapter(chapterResult.data);
        setContents(contentsResult.data);
        setResources(resourcesResult.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load chapter details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="font-medium">Loading chapter details...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-5 bg-slate-100 rounded-full mb-4 text-slate-400 text-4xl">
          <FaBookOpen />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Chapter Not Found</h2>
        <p className="text-slate-500 mt-2">The chapter you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 max-w-7xl mx-auto space-y-6">
      
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full -z-10"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 leading-tight mb-3">
              {chapter.name}
            </h1>
            <p className="text-slate-600 max-w-3xl leading-relaxed">
              {chapter.description || "No description provided."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 border border-blue-100">
                <FaBookOpen /> Chapter {chapter.chapterNo}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 border border-emerald-100">
                <FaLayerGroup /> {contents.length} Contents
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => {
                setEditingContent(null);
                setContentForm({ title: "", description: "", orderNo: contents.length + 1 });
                setContentOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              <FaPlus /> Add Content
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="p-5 bg-blue-50 rounded-full mb-4 text-blue-500 text-3xl">
              <FaLayerGroup />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Content Added</h3>
            <p className="mt-2 text-slate-500 max-w-md">You haven't added any content to this chapter yet. Click the "Add Content" button to start building your material.</p>
          </div>
        ) : (
          contents.map((content, index) => {
            const contentResources = resources.filter((resource) => resource.contentId === content.id);
            
            return (
              <div key={content.id} className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 border border-blue-200">
                      {content.orderNo || index + 1}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 leading-snug">{content.title}</h2>
                      <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed whitespace-pre-wrap">{content.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedContent(content);
                        setEditingResource(null);
                        setResourceForm({ title: "", type: "PDF", youtubeUrl: "" });
                        setSelectedFile(null);
                        setResourceOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-600 hover:text-white"
                    >
                      <FaPlus /> Resource
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
                      className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 transition-colors hover:bg-amber-500 hover:text-white"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(content.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {contentResources.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <p className="text-sm font-medium text-slate-400">No resources attached to this content block.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {contentResources.map((resource) => (
                        <div key={resource.id} className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md hover:border-blue-100">
                          <div className="mb-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              {getResourceBadge(resource.type)}
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                  className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                                >
                                  <FaEdit className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResource(resource.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm line-clamp-2" title={resource.title}>
                              {resource.title}
                            </h4>
                          </div>

                          <div>
                            {(resource.fileUrl || resource.youtubeUrl) ? (
                              <a
                                href={resource.type === "LINK" ? resource.youtubeUrl : resource.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                              >
                                <FaExternalLinkAlt /> Open Resource
                              </a>
                            ) : (
                              <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-400 border border-slate-100 cursor-not-allowed">
                                No Link Available
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {contentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingContent ? "Edit Content" : "Add Content"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Add a structural block to this chapter.</p>
              </div>
              <button 
                onClick={() => setContentOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  placeholder="e.g., Introduction to Real Numbers"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Brief summary of this content section..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Sequence</label>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  value={contentForm.orderNo}
                  onChange={(e) => setContentForm({ ...contentForm, orderNo: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => setContentOpen(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                disabled={isSavingContent || !contentForm.title}
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingContent ? "Saving..." : (editingContent ? "Update Content" : "Add Content")}
              </button>
            </div>
          </div>
        </div>
      )}

      {resourceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingResource ? "Edit Resource" : "Add Resource"}
                </h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">To: {selectedContent?.title}</p>
              </div>
              <button 
                onClick={() => setResourceOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource Title</label>
                <input
                  placeholder="e.g., Chapter Notes PDF"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource Type</label>
                <select
                  title="Resource Type"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer text-sm font-medium"
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                >
                  <option value="PDF">PDF Document</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video File</option>
                  <option value="PPT">PowerPoint (PPT)</option>
                  <option value="EXCEL">Excel Sheet</option>
                  <option value="DOC">Word Doc</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="LINK">External / YouTube Link</option>
                </select>
              </div>

              {resourceForm.type === "LINK" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL</label>
                  <div className="relative">
                    <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      value={resourceForm.youtubeUrl}
                      onChange={(e) => setResourceForm({ ...resourceForm, youtubeUrl: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload File</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaCloudUploadAlt className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                          {selectedFile ? (
                            <span className="font-semibold text-blue-600">{selectedFile.name}</span>
                          ) : (
                            <>Click to upload <span className="font-semibold">or drag and drop</span></>
                          )}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  {editingResource && !selectedFile && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      Note: Leave file selection empty to keep the previously uploaded file.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-4 rounded-b-3xl">
              <button
                onClick={() => setResourceOpen(false)}
                className="rounded-xl px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResource}
                disabled={
                  isSavingResource || 
                  !resourceForm.title || 
                  (resourceForm.type === 'LINK' ? !resourceForm.youtubeUrl : (!selectedFile && !editingResource))
                }
                className="rounded-xl bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingResource ? "Saving..." : (editingResource ? "Update Resource" : "Upload Resource")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}