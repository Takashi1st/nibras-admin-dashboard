import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "منصة نبراس الأزهرية | لوحة التحكم الإدارية",
  description: "لوحة التحكم السحابية المركزية لإدارة مناهج وأسئلة واشتراكات طلاب الأزهر الشريف",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-surface-lowest text-on-surface antialiased selection:bg-primary-container selection:text-surface-lowest">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
