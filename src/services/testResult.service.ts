import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getStudentTestResult = async (
  testId: string,
) => {
  const response = await api.get(
    `/test-attempts/result/${testId}`,
    getHeaders(),
  );

  return response.data;
};