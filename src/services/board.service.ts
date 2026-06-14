import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getBoards = async () => {
  const response = await api.get(
    "/boards",
    getHeaders()
  );

  return response.data;
};

export const createBoard = async (
  payload: any
) => {
  const response = await api.post(
    "/boards",
    payload,
    getHeaders()
  );

  return response.data;
};

export const updateBoard = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/boards/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};

export const deleteBoard = async (
  id: string
) => {
  const response = await api.delete(
    `/boards/${id}`,
    getHeaders()
  );

  return response.data;
};