import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getQuestionBanks = async () => {
  const response = await api.get("/question-banks", getHeaders());

  return response.data;
};

export const getQuestionBankById = async (id: string) => {
  const response = await api.get(`/question-banks/${id}`, getHeaders());

  return response.data;
};

export const createQuestionBank = async (payload: any) => {
  const response = await api.post("/question-banks", payload, getHeaders());

  return response.data;
};

export const updateQuestionBank = async (id: string, payload: any) => {
  const response = await api.patch(
    `/question-banks/${id}`,
    payload,
    getHeaders(),
  );

  return response.data;
};

export const deleteQuestionBank = async (id: string) => {
  const response = await api.delete(`/question-banks/${id}`, getHeaders());

  return response.data;
};
