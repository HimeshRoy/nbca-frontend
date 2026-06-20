"use client";

import { useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      window.location.href =
        "/login";
    }
  }, []);

  return (
    <>{children}</>
  );
}