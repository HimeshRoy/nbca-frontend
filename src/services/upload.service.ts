import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export const uploadFile =
  async (file: File) => {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await api.post(
        "/upload",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };
