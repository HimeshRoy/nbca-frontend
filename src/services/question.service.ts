import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getQuestions = async (testId: string) => {
  const response = await api.get(`/questions/test/${testId}`, getHeaders());

  return response.data;
};

export const getQuestionById = async (id: string) => {
  const response = await api.get(`/questions/${id}`, getHeaders());

  return response.data;
};

export const createQuestion = async (payload: any) => {
  const response = await api.post("/questions", payload, getHeaders());

  return response.data;
};

export const updateQuestion = async (id: string, payload: any) => {
  const response = await api.patch(`/questions/${id}`, payload, getHeaders());

  return response.data;
};

export const deleteQuestion = async (id: string) => {
  const response = await api.delete(`/questions/${id}`, getHeaders());

  return response.data;
};

export const uploadQuestionImage = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/questions/upload", formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadQuestionsExcel = async (file: File, testId: string) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append("testId", testId);

  const response = await api.post("/questions/upload-excel", formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
