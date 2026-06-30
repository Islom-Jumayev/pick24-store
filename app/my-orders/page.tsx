"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../seller/ProtectedRoute";

type Order = {
  id: string;
  shop_id: string;
  total_price: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Kutilmoqda";
      case "confirmed": return "Tasdiqlangan";
      case "processing": return "Tayyorlanmoqda";
      case "delivered": return "Yetkazildi";
      case "cancelled": return "Bekor qilindi";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return "";
      case "confirmed": return "✅";
      case "processing": return "📦";
      case "delivered": return "";
      case "cancelled": return "❌";
      default: return "📋";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              ← Bosh sahifaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Buyurtmalarim</span>
            <Link href="/shops" className="text-blue-600 hover:underline font-medium">
              Do'konlar →
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Sarlavha */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mening Buyurtmalarim
              </h1>
              <p className="text-gray-500">
                Barcha buyurtmalaringiz tarixi va holati
              </p>
            </div>

            {/* Statistika */}
            {orders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Jami buyurtmalar</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Kutilmoqda</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === "pending").length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Tayyorlanmoqda</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === "processing" || o.status === "confirmed").length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Yetkazildi</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === "delivered").length}
                  </p>
                </div>
              </div>
            )}

            {/* Yuklanmoqda */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Buyurtmalar yuklanmoqda...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">️</div>
                <p className="text-gray-500 text-xl mb-4">Hali buyurtmalar yo'q</p>
                <p className="text-gray-400 mb-6">Do'konlardan mahsulot tanlang va buyurtma bering</p>
                <Link href="/shops" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Do'konlarga o'tish
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Buyurtma sarlavhasi */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)} {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Jami summa</p>
                          <p className="text-xl font-bold text-blue-600">
                            {new Intl.NumberFormat("uz-UZ").format(order.total_price)} so'm
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(order.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>

                    {/* Mijoz ma'lumotlari */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">👤 Mijoz</p>
                          <p className="font-semibold text-gray-900">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1"> Telefon</p>
                          <p className="font-semibold text-gray-900">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">📍 Manzil</p>
                          <p className="font-semibold text-gray-900">{order.customer_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mahsulotlar */}
                    <div className="px-6 py-4">
                      <p className="text-xs text-gray-500 mb-3 font-medium">Mahsulotlar:</p>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.product_name} 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.product_name}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × {new Intl.NumberFormat("uz-UZ").format(item.price)} so'm
                              </p>
                            </div>
                            <p className="font-bold text-gray-900">
                              {new Intl.NumberFormat("uz-UZ").format(item.quantity * item.price)} so'm
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Yetkazildi bo'lsa - baho berish tugmasi (keyinroq qo'shamiz) */}
                    {order.status === "delivered" && (
                      <div className="px-6 py-4 bg-green-50 border-t border-green-100">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Buyurtma muvaffaqiyatli yetkazildi!
                        </p>
                      </div>
                    )}

                    {/* Bekor qilindi bo'lsa */}
                    {order.status === "cancelled" && (
                      <div className="px-6 py-4 bg-red-50 border-t border-red-100">
                        <p className="text-sm text-red-700 font-medium">
                          ❌ Buyurtma bekor qilindi
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}