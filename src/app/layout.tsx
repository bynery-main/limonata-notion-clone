import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from '../components/Footer';
import { AuthProvider } from '@/components/auth-provider/AuthProvider'; // Import the AuthProvider

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <Footer platform="desktop" />
        </AuthProvider>
      </body>
    </html>
  );
}
