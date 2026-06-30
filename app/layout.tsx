import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; // ← YANGI
import { NotificationProvider } from "./context/NotificationContext";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pick24 - Online Savdo",
  description: "Minimalistik online savdo platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
     <body className={`${geistSans.variable} ${geistMono.variable} antialiased} flex flex-col min-h-screen`}>
  <CartProvider>
    <AuthProvider>
      <NotificationProvider>
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </NotificationProvider>
    </AuthProvider>
  </CartProvider>
</body>
    </html>
  );
}