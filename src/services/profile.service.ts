import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getMyProfile = async () => {
  const response = await api.get(
    "/teachers/me",
    getHeaders()
  );

  return response.data;
};

export const updateTeacherProfile = async (
  id: string,
  payload: any
) => {
  const response = await api.patch(
    `/teachers/${id}`,
    payload,
    getHeaders()
  );

  return response.data;
};