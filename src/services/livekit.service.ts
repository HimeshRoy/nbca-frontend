import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export interface LiveClassRoomData {
  token: string;
  url: string;
  roomName: string;
  liveClassId: string;
  role: "TEACHER" | "STUDENT";
}

export const joinLiveClassRoom = async (
  liveClassId: string,
): Promise<LiveClassRoomData> => {
  const response = await api.post(
    `/live-classes/${liveClassId}/join`,
    {},
    getHeaders(),
  );

  return response.data.data;
};
