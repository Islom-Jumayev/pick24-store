"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
    }
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchOrders();
    }
  }, [shopId]);

  const fetchOrders = async () => {
    if (!shopId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      fetchOrders(); // Yangilash
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  if (!shopId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">Pick24</Link>
          </div>
        </header>
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-gray-500 text-xl">Sizda do'kon yo'q. Avval do'kon oching.</p>
          <Link href="/seller/register" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Do'kon Ochish
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute shopRequired={true}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/shops" className="text-blue-600 hover:underline font-medium">
              ← Orqaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Buyurtmalar</span>
            <Link href="/seller/add-product" className="text-blue-600 hover:underline font-medium">
              Mahsulot qo'shish →
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buyurtmalar Ro'yxati
            </h1>
            <p className="text-gray-500 mb-8">
              Do'koningizga kelgan barcha buyurtmalar
            </p>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500 text-xl mb-4">Hali buyurtmalar yo'q</p>
                <p className="text-gray-400">Buyurtmalar kelganda shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6">
                    {/* Buyurtma sarlavhasi */}
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString("uz-UZ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat("uz-UZ").format(order.total_price)} so'm
                        </p>
                      </div>
                    </div>

                    {/* Mijoz ma'lumotlari */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mijoz</p>
                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Telefon</p>
                        <p className="font-semibold text-gray-900">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Manzil</p>
                        <p className="font-semibold text-gray-900">{order.customer_address}</p>
                      </div>
                    </div>

                    {/* Mahsulotlar */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Mahsulotlar:</p>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <img src={item.image} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
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

                    {/* Holatni o'zgartirish */}
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                          >
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                          >
                            Bekor qilish
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "processing")}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                        >
                          Tayyorlashni boshlash
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          Yetkazildi deb belgilash
                        </button>
                      )}
                    </div>
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