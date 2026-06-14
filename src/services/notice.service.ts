import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getNotices = async () => {
  const response = await api.get(
    "/notices",
    getHeaders()
  );

  return response.data;
};

export const createNotice = async (
  payload: any
) => {
  const response = await api.post(
    "/notices",
    payload,
    getHeaders()
  );

  return response.data;
};

export const updateNotice = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/notices/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};

export const deleteNotice = async (
  id: string
) => {
  const response = await api.delete(
    `/notices/${id}`,
    getHeaders()
  );

  return response.data;
};