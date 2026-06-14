import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getTeachers = async () => {
  const response = await api.get("/teachers", getHeaders());

  return response.data;
};

export const createTeacher = async (payload: any) => {
  const response = await api.post("/teachers", payload, getHeaders());

  return response.data;
};

export const updateTeacher = async (id: string, payload: any) => {
  const response = await api.patch(`/teachers/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteTeacher = async (id: string) => {
  const response = await api.delete(`/teachers/${id}`, getHeaders());

  return response.data;
};

export const assignClassesToTeacher = async (
  teacherId: string,
  classIds: string[],
) => {
  const response = await api.post(
    `/teachers/${teacherId}/classes`,
    {
      classIds,
    },
    getHeaders(),
  );

  return response.data;
};

export const assignSubjectsToTeacher = async (
  teacherId: string,
  subjectIds: string[],
) => {
  const response = await api.post(
    `/teachers/${teacherId}/subjects`,
    {
      subjectIds,
    },
    getHeaders(),
  );

  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/teachers/me", getHeaders());

  return response.data;
};
