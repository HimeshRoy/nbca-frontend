import "./globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'North Bengal Cloud Academy - Online Classes for Class 10 (CBSE, ICSE & WBBSE)',
  description: 'Join NBCA for premium online schooling for Class 10. Expert coaching in Science, Maths, and English tailored for CBSE, ICSE/ISC, and WBBSE boards.',
  // Keep the description between 150-160 characters for best results!
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}