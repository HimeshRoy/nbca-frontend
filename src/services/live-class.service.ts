import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getLiveClasses = async () => {
  const response = await api.get("/live-classes", getHeaders());

  return response.data;
};

export const getLiveClassById = async (id: string) => {
  const response = await api.get(`/live-classes/${id}`, getHeaders());

  return response.data;
};

export const createLiveClass = async (payload: any) => {
  const response = await api.post("/live-classes", payload, getHeaders());

  return response.data;
};

export const updateLiveClass = async (id: string, payload: any) => {
  const response = await api.patch(
    `/live-classes/${id}`,
    payload,
    getHeaders(),
  );

  return response.data;
};

export const deleteLiveClass = async (id: string) => {
  const response = await api.delete(`/live-classes/${id}`, getHeaders());

  return response.data;
};

export const getLiveClassStats = async () => {
  const response = await api.get("/live-classes/stats", getHeaders());

  return response.data;
};

export const getLiveClassAttendance = async (id: string) => {
  const response = await api.get(
    `/live-classes/${id}/attendance`,
    getHeaders(),
  );

  return response.data;
};
