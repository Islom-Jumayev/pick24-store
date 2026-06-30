"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

export default function SellerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

    useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
      fetchStats(savedShopId);
    } else if (user) {
      // Agar localStorage bo'sh bo'lsa, foydalanuvchining do'konini qidirish
      findUserShop();
    }
  }, [user]);

  const findUserShop = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("shops")
      .select("id, name")
      .eq("user_id", user.id)
      .single();
    
    if (data && !error) {
      localStorage.setItem("currentShopId", data.id);
      localStorage.setItem("currentShopName", data.name);
      setShopId(data.id);
      fetchStats(data.id);
    }
  };

  const fetchStats = async (shopId: string) => {
    // Mahsulotlar soni
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId);

    // Buyurtmalar
    const { data: ordersData } = await supabase
      .from("orders")
      .select("total_price, status")
      .eq("shop_id", shopId);

    const totalOrders = ordersData?.length || 0;
    const totalRevenue = ordersData?.reduce((sum, order) => {
      return order.status !== "cancelled" ? sum + order.total_price : sum;
    }, 0) || 0;
    const pendingOrders = ordersData?.filter(o => o.status === "pending").length || 0;

    setStats({
      totalProducts: productsCount || 0,
      totalOrders,
      totalRevenue,
      pendingOrders
    });
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
          <p className="text-gray-500 text-xl mb-4">Sizda hali do'kon yo'q</p>
          <Link href="/seller/register" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
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
            <span className="text-xl font-bold text-gray-800">Do'konim</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Sarlavha */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Do'kon Boshqaruv Paneli
              </h1>
              <p className="text-gray-500">
                Barcha funksiyalar va ko'rsatkichlar bir joyda
              </p>
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-600">
                <p className="text-sm text-gray-500 mb-1">Mahsulotlar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-600">
                <p className="text-sm text-gray-500 mb-1">Jami daromad</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("uz-UZ").format(stats.totalRevenue)} so'm
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-600">
                <p className="text-sm text-gray-500 mb-1">Kutilmoqda</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-600">
                <p className="text-sm text-gray-500 mb-1">Jami buyurtmalar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>

            {/* Funksiyalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mahsulot qo'shish */}
              <Link href="/seller/add-product" className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition">➕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mahsulot Qo'shish</h3>
                <p className="text-gray-500 text-sm">Yangi mahsulot qo'shing va sotuvga qo'ying</p>
              </Link>

              {/* Mahsulotlarim */}
              <Link href="/seller/products" className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mahsulotlarim</h3>
                <p className="text-gray-500 text-sm">Barcha mahsulotlaringizni ko'ring va boshqaring</p>
              </Link>

              {/* Buyurtmalar */}
              <Link href="/seller/orders" className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition">🛒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Buyurtmalar</h3>
                <p className="text-gray-500 text-sm">Kelgan buyurtmalarni ko'ring va boshqaring</p>
              </Link>

              {/* Statistika */}
              <Link href="/seller/dashboard" className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Statistika</h3>
                <p className="text-gray-500 text-sm">Batafsil tahlillar va hisobotlar</p>
              </Link>

              {/* Do'kon sozlamalari */}
              <Link href="/seller/register" className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition">⚙️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Do'kon Sozlamalari</h3>
                <p className="text-gray-500 text-sm">Do'kon ma'lumotlarini yangilang</p>
              </Link>

              {/* Do'konni ko'rish */}
              <a href={`/shops/${shopId}`} className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition text-center group">
                <div className="text-6xl mb-4 group-hover:scale-110 transition">🏪</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Do'konni Ko'rish</h3>
                <p className="text-gray-500 text-sm">Do'koningizni mijozlar ko'zi bilan ko'ring</p>
              </a>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}