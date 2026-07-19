import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title:
    "North Bengal Cloud Academy - Online Classes for Class 10 (CBSE, ICSE & WBBSE)",
  description:
    "Join NBCA for premium online schooling for Class 10. Expert coaching in Science, Maths, and English tailored for CBSE, ICSE/ISC, and WBBSE boards.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>{children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
