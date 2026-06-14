import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getClasses = async () => {
  const response = await api.get(
    "/classes",
    getHeaders()
  );

  return response.data;
};

export const createClass = async (
  payload: any
) => {
  const response = await api.post(
    "/classes",
    payload,
    getHeaders()
  );

  return response.data;
};

export const updateClass = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/classes/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};

export const deleteClass = async (
  id: string
) => {
  const response = await api.delete(
    `/classes/${id}`,
    getHeaders()
  );

  return response.data;
};