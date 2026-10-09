"use client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // YANGI: Mobil menyu holati
  const [searchTerm, setSearchTerm] = useState(""); // YANGI: Qidiruv uchun

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Chap tomon: Logo va Mobil menyu tugmasi */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-600 text-2xl p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
            <button 
              onClick={() => router.push("/")} 
              className="text-2xl font-bold text-blue-600 hover:opacity-80"
            >
              Pick24
            </button>
          </div>
          
          {/* O'rta: Desktop navigatsiya */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600">Bosh sahifa</Link>
            <Link href="/shops" className="text-gray-600 hover:text-blue-600">Do'konlar</Link>
            <Link href="/promotions" className="text-gray-600 hover:text-blue-600">Aksiyalar</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">Aloqa</Link>
          </nav>
          
          {/* O'ng tomon: Harakatlar */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                {/* Desktop foydalanuvchi ma'lumotlari */}
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  <div className="flex gap-3 text-xs">
                    <Link href="/my-orders" className="text-blue-600 hover:underline">Buyurtmalarim</Link>
                    <Link href="/my-chats" className="text-blue-600 hover:underline">Chatlarim</Link>
                    <Link href="/seller/messages" className="text-blue-600 hover:underline">Xabarlar</Link>
                    <Link href="/seller" className="text-blue-600 hover:underline font-medium">Do'konim</Link>
                  </div>
                </div>

                {/* Bildirishnomalar */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition text-xl"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Bildirishnomalar ro'yxati (Tuzatilgan o'lcham) */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[90vw] md:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                        <h3 className="font-bold text-gray-900">Bildirishnomalar</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                            Barchasini o'qish
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <p className="text-4xl mb-2">🔕</p>
                          <p className="text-sm">Yangi bildirishnomalar yo'q</p>
                        </div>
                      ) : (
                        <div>
                          {notifications.map((notif) => (
                            <Link
                              key={notif.id}
                              href={notif.link}
                              onClick={() => {
                                markAsRead(notif.id);
                                setShowNotifications(false);
                              }}
                              className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                                !notif.is_read ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{notif.type === "message" ? "💬" : "🛒"}</span>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.created_at).toLocaleString("uz-UZ")}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chiqish tugmasi (Desktop) */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-sm font-medium"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden md:block text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-2">
                  Kirish
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            {/* Savat */}
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
              <button className="text-gray-600 hover:text-blue-600 text-xl p-1">🛒</button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= MOBIL MENYU ================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
            
            {/* 1. Qidiruv inputi (Mobil uchun) */}
            <div className="relative">
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>

            {/* 2. Navigatsiya havolalari */}
            <nav className="flex flex-col space-y-3 text-gray-600 font-medium">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Bosh sahifa</Link>
              <Link href="/shops" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Do'konlar</Link>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Aksiyalar</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-600 py-1">Aloqa</Link>
            </nav>

            {/* 3. Foydalanuvchi menyusi (Agar kirgan bo'lsa) */}
            {user && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                <div className="flex flex-col space-y-3 text-sm">
                  <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 hover:underline flex items-center gap-2">
                    📦 Buyurtmalarim
                  </Link>
                  <Link href="/my-chats" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 hover:underline flex items-center gap-2">
                    💬 Chatlarim
                  </Link>
                  <Link href="/seller/messages" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 hover:underline flex items-center gap-2">
                    📨 Xabarlar
                  </Link>
                  <Link href="/seller" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
                    🏪 Do'konim
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="text-left text-red-600 font-medium flex items-center gap-2 py-1"
                  >
                    🚪 Chiqish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}