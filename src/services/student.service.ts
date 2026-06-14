import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getStudents = async () => {
  const response = await api.get(
    "/students",
    getHeaders()
  );

  return response.data;
};

export const createStudent = async (
  payload: any
) => {
  const response = await api.post(
    "/students",
    payload,
    getHeaders()
  );

  return response.data;
};

export const updateStudent = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/students/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};

export const deleteStudent = async (
  id: string
) => {
  const response = await api.delete(
    `/students/${id}`,
    getHeaders()
  );

  return response.data;
};