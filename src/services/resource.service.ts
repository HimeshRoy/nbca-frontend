import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getResources = async () => {
  const response = await api.get("/teacher/resources", getHeaders());

  return response.data;
};

export const getResourceById = async (id: string) => {
  const response = await api.get(`/teacher/resources/${id}`, getHeaders());

  return response.data;
};

export const createResource = async (payload: any) => {
  const response = await api.post("/teacher/resources", payload, getHeaders());

  return response.data;
};

export const updateResource = async (id: string, payload: any) => {
  const response = await api.patch(
    `/teacher/resources/${id}`,
    payload,
    getHeaders(),
  );

  return response.data;
};

export const deleteResource = async (id: string) => {
  const response = await api.delete(`/teacher/resources/${id}`, getHeaders());

  return response.data;
};

export const getResourceStats = async () => {
  const response = await api.get("/teacher/resources/stats", getHeaders());

  return response.data;
};

export const uploadResourceFile = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/teacher/resources/upload", formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
