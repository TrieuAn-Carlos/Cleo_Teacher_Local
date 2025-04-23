import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "../context/AuthContext";
import ClientSideLoader from "../components/ClientSideLoader";

export const metadata: Metadata = {
  title: "Automagical Attendance Checking",
  description: "Meet Cleo - Automagical Attendance Checking",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Using className instead of inline styles to avoid hydration issues */}
      <body className="bg-black text-white min-h-screen flex flex-col">
        <AuthProvider>
          <ClientSideLoader>
            {/* TopBar removed from here */}
            {/* <TopBar /> */}
            {/* Render children directly within ClientSideLoader */}
            {children}
          </ClientSideLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
