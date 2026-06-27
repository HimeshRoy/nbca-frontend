import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getMyProfile = async () => {
  const response = await api.get("/profile/me", getHeaders());

  return response.data;
};

export const updateMyProfile = async (payload: any) => {
  const response = await api.put("/profile/me", payload, getHeaders());

  return response.data;
};

export const getStudentIdCard = async () => {
  const response = await api.get("/profile/id-card", getHeaders());

  return response.data;
};

export const downloadStudentIdCard = async () => {
  const response = await api.get("/profile/id-card/pdf", {
    ...getHeaders(),
    responseType: "blob",
  });

  return response.data;
};

export const viewStudentIdCard = async () => {
  const response = await api.get("/profile/id-card/view", {
    ...getHeaders(),
    responseType: "blob",
  });

  return response.data;
};
