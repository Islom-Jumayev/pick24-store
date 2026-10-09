"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import ProtectedRoute from "../../ProtectedRoute";
import ImageUpload from "../../../components/ImageUpload"; // ← YANGI QO'SHILDI

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState("");

  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
      fetchProduct(savedShopId);
    }
  }, [productId]);

  const fetchProduct = async (shopId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("shop_id", shopId)
      .single();

    if (error || !data) {
      alert("Mahsulot topilmadi");
      router.push("/seller/dashboard");
    } else {
      setName(data.name);
      setPrice(data.price.toString());
      setDescription(data.description || "");
      setImage(data.image);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Rasm yuklanganligini tekshirish
    if (!image) {
      alert("Iltimos, mahsulot rasmini yuklang!");
      setLoading(false);
      return;
    }

    const priceNum = parseInt(price);
    const priceText = new Intl.NumberFormat("uz-UZ").format(priceNum) + " so'm";

    const { error } = await supabase
      .from("products")
      .update({
        name: name,
        price: priceNum,
        price_text: priceText,
        description: description,
        image: image
      })
      .eq("id", productId);

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      alert("✅ Mahsulot muvaffaqiyatli yangilandi!");
      router.push("/seller/dashboard");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute shopRequired={true}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/seller/dashboard" className="text-blue-600 hover:underline font-medium">
              ← Orqaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Mahsulotni Tahrirlash</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Mahsulotni Yangilash
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Mahsulot ma'lumotlarini o'zgartiring
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narxi (so'm) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rasm Yuklash - O'ZGARTIRILDI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulot rasmi *
                </label>
                <ImageUpload
                  value={image}
                  onChange={(url) => setImage(url)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}