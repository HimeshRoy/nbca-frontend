const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const adminLogin = async (
  email: string,
  password: string
) => {
  const res = await fetch(
    `${API_URL}/auth/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return res.json();
};

export const teacherLogin = async (
  email: string,
  password: string
) => {
  const res = await fetch(
    `${API_URL}/auth/teacher/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return res.json();
};

export const studentLogin = async (
  studentId: string,
  password: string
) => {
  const res = await fetch(
    `${API_URL}/auth/student/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        password,
      }),
    }
  );

  return res.json();
};