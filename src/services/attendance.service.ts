import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const markLiveClassLeave = async (
  liveClassId: string,
) => {
  const response = await api.post(
    `/attendance/live-class/${liveClassId}/leave`,
    {},
    getHeaders(),
  );

  return response.data;
};

export const getMyAttendance = async () => {
  const response = await api.get(
    "/attendance/my",
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  return response.data;
};