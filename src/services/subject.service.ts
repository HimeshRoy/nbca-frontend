import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getSubjects = async () => {
  const response = await api.get("/subjects", getHeaders());

  return response.data;
};

export const createSubject = async (payload: any) => {
  const response = await api.post("/subjects", payload, getHeaders());

  return response.data;
};

export const updateSubject = async (id: string, payload: any) => {
  const response = await api.patch(`/subjects/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteSubject = async (id: string) => {
  const response = await api.delete(`/subjects/${id}`, getHeaders());

  return response.data;
};

export const getStudentSubjects = async () => {
  const response = await api.get("/subjects/student", getHeaders());

  return response.data;
};
