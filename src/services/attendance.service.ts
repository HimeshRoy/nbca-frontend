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