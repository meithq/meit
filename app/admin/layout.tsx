import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Meit",
  description: "Panel de administración",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}