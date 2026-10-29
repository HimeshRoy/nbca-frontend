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
  displayName: string;

  liveClass: {
    id: string;
    title: string;
    description?: string | null;

    teacher: {
      id: string;
      name: string;
    };

    class: {
      id: string;
      name: string;
    };

    subject: {
      id: string;
      name: string;
    };

    startTime: string;
    endTime: string;
    isActive: boolean;
  };
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
