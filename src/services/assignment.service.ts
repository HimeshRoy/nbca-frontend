import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getAssignments = async () => {
  const response = await api.get("/assignments", getHeaders());

  return response.data;
};

export const getAssignmentById = async (id: string) => {
  const response = await api.get(`/assignments/${id}`, getHeaders());

  return response.data;
};

export const createAssignment = async (payload: any) => {
  const response = await api.post("/assignments", payload, getHeaders());

  return response.data;
};

export const updateAssignment = async (id: string, payload: any) => {
  const response = await api.patch(`/assignments/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteAssignment = async (id: string) => {
  const response = await api.delete(`/assignments/${id}`, getHeaders());

  return response.data;
};
