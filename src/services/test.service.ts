import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getTests = async () => {
  const response = await api.get(
    "/tests",
    getHeaders()
  );

  return response.data;
};

export const getTestById = async (
  id: string
) => {
  const response = await api.get(
    `/tests/${id}`,
    getHeaders()
  );

  return response.data;
};

export const createTest = async (
  payload: any
) => {
  const response = await api.post(
    "/tests",
    payload,
    getHeaders()
  );

  return response.data;
};

export const updateTest = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/tests/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};

export const deleteTest = async (
  id: string
) => {
  const response = await api.delete(
    `/tests/${id}`,
    getHeaders()
  );

  return response.data;
};