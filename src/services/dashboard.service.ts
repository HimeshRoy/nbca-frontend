import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getDashboardStats = async () => {
  const token = getToken();

  const response = await api.get("/dashboard/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTeacherDashboard = async () => {
  const token = getToken();

  const response = await api.get("/dashboard/teacher", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getStudentDashboard = async () => {
  const response = await api.get("/dashboard/student", getHeaders());

  return response.data;
};
