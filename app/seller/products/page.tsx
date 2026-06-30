"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";

type Product = {
  id: number;
  name: string;
  price: number;
  price_text: string;
  description: string;
  image: string;
  shop_id: string;
  created_at: string;
};

export default function SellerProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
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
      fetchProducts();
    }
  }, [shopId]);

  const fetchProducts = async () => {
    if (!shopId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      alert("✅ Mahsulot o'chirildi");
      fetchProducts();
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
            <Link href="/seller/dashboard" className="text-blue-600 hover:underline font-medium">
              ← Dashboard
            </Link>
            <span className="text-xl font-bold text-gray-800">Mahsulotlarim</span>
            <Link href="/seller/add-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              + Yangi mahsulot
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Sarlavha */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mahsulotlarim
              </h1>
              <p className="text-gray-500">
                Do'koningizdagi barcha mahsulotlar ({products.length} ta)
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-500 text-xl mb-4">Hali mahsulotlar yo'q</p>
                <p className="text-gray-400 mb-6">Do'koningizga birinchi mahsulotingizni qo'shing</p>
                <Link href="/seller/add-product" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  + Mahsulot qo'shish
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition">
                    {/* Rasm */}
                    <div className="relative h-48 bg-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Ma'lumotlar */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-blue-600 font-bold text-xl mb-2">
                        {product.price_text}
                      </p>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {product.description || "Tavsif yo'q"}
                      </p>

                      {/* Tugmalar */}
                      <div className="flex gap-2">
                        <Link 
                          href={`/seller/edit-product/${product.id}`}
                          className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-200 transition text-center text-sm"
                        >
                          ️ Tahrirlash
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition text-sm"
                        >
                          🗑️ O'chirish
                        </button>
                      </div>
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