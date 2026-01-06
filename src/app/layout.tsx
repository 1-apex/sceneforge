import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SceneForge - 3D Editor",
  description: "Browser-based 3D editor with React Three Fiber JSX export",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
