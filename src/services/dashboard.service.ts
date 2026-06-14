import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

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
