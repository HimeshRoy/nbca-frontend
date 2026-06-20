import { api } from "@/lib/api";

export const sendOTP = async (email: string, type: string) => {
  const response = await api.post("/otp/send", {
    email,
    type,
  });

  return response.data;
};

export const verifyOTP = async (email: string, otp: string, type: string) => {
  const response = await api.post("/otp/verify", {
    email,
    otp,
    type,
  });

  return response.data;
};
