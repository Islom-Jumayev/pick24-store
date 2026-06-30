"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, shopRequired = false }: { 
  children: React.ReactNode;
  shopRequired?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Foydalanuvchi login qilmagan
        router.push("/login");
      } else if (shopRequired) {
        // Do'kon ochish yoki mahsulot qo'shish uchun do'kon ID kerak
        const shopId = localStorage.getItem("currentShopId");
        if (!shopId) {
          // Do'kon yo'q - do'kon ochish sahifasiga yuborish
          router.push("/seller/register");
        } else {
          setIsAuthorized(true);
        }
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, shopRequired, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}