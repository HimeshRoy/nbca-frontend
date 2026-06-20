import { api } from "@/lib/api";

export const studentSignup = async (payload: any) => {
  const response = await api.post("/auth/student-signup", payload);

  return response.data;
};
