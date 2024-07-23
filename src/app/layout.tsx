import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from '../components/Footer'; // Import the Footer component, adjust the path as necessary

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
        {children}
        <Toaster position="top-right" />
        <Footer /> {/* Add the Footer component here */}
      </body>
    </html>
  );
}