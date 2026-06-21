import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getChaptersBySubject = async (subjectId: string) => {
  const response = await api.get(
    `/chapters/subject/${subjectId}`,
    getHeaders(),
  );

  return response.data;
};

export const createChapter = async (payload: any) => {
  const response = await api.post("/chapters", payload, getHeaders());

  return response.data;
};

export const updateChapter = async (id: string, payload: any) => {
  const response = await api.patch(`/chapters/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteChapter = async (id: string) => {
  const response = await api.delete(`/chapters/${id}`, getHeaders());

  return response.data;
};

export const getChapterById = async (id: string) => {
  const response = await api.get(`/chapters/${id}`, getHeaders());

  return response.data;
};

export const getStudentChapters = async (subjectId: string) => {
  const response = await api.get(
    `/chapters/student/${subjectId}`,
    getHeaders(),
  );

  return response.data;
};
