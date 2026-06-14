const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const sendContactMessage = async (payload) => {
  const response = await fetch(
    `${API_URL}/contact`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return response.json();
};