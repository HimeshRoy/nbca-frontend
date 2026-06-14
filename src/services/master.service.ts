import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const getBoards = async () => {
  const token = getToken();

  const response = await api.get(
    "/boards",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getClasses = async () => {
  const token = getToken();

  const response = await api.get(
    "/classes",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getAcademicSessions =
  async () => {
    const token = getToken();

    const response = await api.get(
      "/academic-sessions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };