"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";

type Order = {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_items: any[];
};

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
    }
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchStats();
    }
  }, [shopId]);

  const fetchStats = async () => {
    if (!shopId) return;

    setLoading(true);

    // Buyurtmalarni olish
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Xatolik:", ordersError);
      setLoading(false);
      return;
    }

    // Mahsulotlar sonini olish
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId);

    // Statistikani hisoblash
    const totalOrders = ordersData?.length || 0;
    const totalRevenue = ordersData?.reduce((sum, order) => {
      return order.status !== "cancelled" ? sum + order.total_price : sum;
    }, 0) || 0;

    const pendingOrders = ordersData?.filter(o => o.status === "pending").length || 0;
    const confirmedOrders = ordersData?.filter(o => o.status === "confirmed").length || 0;
    const processingOrders = ordersData?.filter(o => o.status === "processing").length || 0;
    const deliveredOrders = ordersData?.filter(o => o.status === "delivered").length || 0;
    const cancelledOrders = ordersData?.filter(o => o.status === "cancelled").length || 0;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts: productsCount || 0
    });

    // Oxirgi 5 ta buyurtmani saqlash
    setRecentOrders(ordersData?.slice(0, 5) || []);

    setLoading(false);
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
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              ← Bosh sahifaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Sotuvchi Paneli</span>
                        <div className="flex gap-4">
              <Link href="/seller/products" className="text-blue-600 hover:underline font-medium">
                Mahsulotlar
              </Link>
              <Link href="/seller/add-product" className="text-blue-600 hover:underline font-medium">
                + Qo'shish
              </Link>
              <Link href="/seller/orders" className="text-blue-600 hover:underline font-medium">
                Buyurtmalar
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Sarlavha */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Do'kon Statistikasi
              </h1>
              <p className="text-gray-500">
                Do'koningizning barcha ko'rsatkichlari va tahlillar
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
              </div>
            ) : (
              <>
                {/* Asosiy ko'rsatkichlar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Jami buyurtmalar */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Jami buyurtmalar</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                      </div>
                      <div className="text-4xl">📦</div>
                    </div>
                  </div>

                  {/* Jami daromad */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Jami daromad</p>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat("uz-UZ").format(stats.totalRevenue)} so'm
                        </p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>

                  {/* Mahsulotlar */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Mahsulotlar</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                      </div>
                      <div className="text-4xl">🛍️</div>
                    </div>
                  </div>

                  {/* Kutilmoqda */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Kutilmoqda</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                      </div>
                      <div className="text-4xl"></div>
                    </div>
                  </div>
                </div>

                {/* Buyurtmalar holati */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Buyurtmalar holati</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600 mb-1">{stats.pendingOrders}</p>
                      <p className="text-xs text-gray-600">Kutilmoqda</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 mb-1">{stats.confirmedOrders}</p>
                      <p className="text-xs text-gray-600">Tasdiqlangan</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600 mb-1">{stats.processingOrders}</p>
                      <p className="text-xs text-gray-600">Tayyorlanmoqda</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 mb-1">{stats.deliveredOrders}</p>
                      <p className="text-xs text-gray-600">Yetkazildi</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 mb-1">{stats.cancelledOrders}</p>
                      <p className="text-xs text-gray-600">Bekor qilindi</p>
                    </div>
                  </div>
                </div>

                {/* Oxirgi buyurtmalar */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Oxirgi buyurtmalar</h2>
                    <Link href="/seller/orders" className="text-blue-600 hover:underline text-sm font-medium">
                      Barchasini ko'rish →
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Hali buyurtmalar yo'q</p>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleString("uz-UZ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">
                                {new Intl.NumberFormat("uz-UZ").format(order.total_price)} so'm
                              </p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>👤 {order.customer_name}</span>
                            <span> {order.customer_phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}