import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/auth-provider/AuthProvider"; // Import the AuthProvider
import { SocketProvider } from "@/lib/providers/socket-provider";

const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Welcome to limonata",
  description: "Created by the sexiest motherfuckers alive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
