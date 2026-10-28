import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export type ClassroomChatMessage = {
  id: string;
  identity: string;
  name: string;
  message: string;
  timestamp: number;
};

export const getClassroomChat = async (
  liveClassId: string,
): Promise<ClassroomChatMessage[]> => {
  const response = await api.get(
    `/live-class/chat/${liveClassId}`,
    getHeaders(),
  );

  return response.data.messages;
};

export const saveClassroomChatMessage = async (
  liveClassId: string,
  data: {
    identity: string;
    name: string;
    message: string;
    timestamp: number;
  },
): Promise<ClassroomChatMessage> => {
  const response = await api.post(
    `/live-class/chat/${liveClassId}`,
    data,
    getHeaders(),
  );

  return response.data.message;
};
