import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getContentsByChapter = async (chapterId: string) => {
  const response = await api.get(
    `/contents/chapter/${chapterId}`,
    getHeaders(),
  );

  return response.data;
};

export const createContent = async (payload: any) => {
  const response = await api.post("/contents", payload, getHeaders());

  return response.data;
};

export const updateContent = async (id: string, payload: any) => {
  const response = await api.patch(`/contents/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteContent = async (id: string) => {
  const response = await api.delete(`/contents/${id}`, getHeaders());

  return response.data;
};
