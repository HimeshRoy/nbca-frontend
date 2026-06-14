import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getAssignmentSubmissions =
  async (assignmentId: string) => {
    const response =
      await api.get(
        `/submissions/assignment/${assignmentId}`,
        getHeaders()
      );

    return response.data;
  };

export const evaluateSubmission =
  async (
    submissionId: string,
    payload: {
      marks: number;
      remarks?: string;
    }
  ) => {
    const response =
      await api.patch(
        `/submissions/${submissionId}/evaluate`,
        payload,
        getHeaders()
      );

    return response.data;
  };