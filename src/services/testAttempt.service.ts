import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const attemptTest = async (
  testId: string,
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[]
) => {
  const response = await api.post(
    `/test-attempts/${testId}`,
    { answers },
    getHeaders()
  );

  return response.data;
};