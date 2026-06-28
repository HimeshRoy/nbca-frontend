import { api } from "@/lib/api";

export const verifyStudentCard = async (
  studentId: string,
) => {
  const response = await api.get(
    `/profile/verify/${studentId}`,
  );

  return response.data;
};