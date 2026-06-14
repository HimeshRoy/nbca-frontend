import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const getAcademicSessions = async () => {
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

export const createAcademicSession =
  async (payload: any) => {
    const token = getToken();

    const response = await api.post(
      "/academic-sessions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

  export const updateAcademicSession =
  async (
    id: string,
    payload: any
  ) => {
    const token = getToken();

    const response =
      await api.patch(
        `/academic-sessions/${id}`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };

export const deleteAcademicSession =
  async (id: string) => {
    const token = getToken();

    const response =
      await api.delete(
        `/academic-sessions/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };