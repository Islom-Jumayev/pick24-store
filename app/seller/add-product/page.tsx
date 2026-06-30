"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../ProtectedRoute"; // ← YANGI QO'SHILDI

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [shopId, setShopId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShopLocked, setIsShopLocked] = useState(false);

  // localStorage'dan do'kon ID'ni o'qish
  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    const savedShopName = localStorage.getItem("currentShopName");
    
    if (savedShopId) {
      setShopId(savedShopId);
      setIsShopLocked(true);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    // Foydalanuvchini tekshirish ← YANGI QO'SHILDI
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Iltimos, avval tizimga kiring");
      router.push("/login");
      return;
    }
    
    const priceNum = parseInt(price);
    const priceText = new Intl.NumberFormat("uz-UZ").format(priceNum) + " so'm";
    
    // Bazaga mahsulot qo'shish
    const { data, error } = await supabase
      .from("products")
      .insert([
        { 
          shop_id: shopId,
          name: name,
          price: priceNum,
          price_text: priceText,
          description: description,
          image: image
        }
      ]);
    
    if (error) {
      alert("Xatolik yuz berdi: " + error.message);
      setLoading(false);
    } else {
      alert(`"${name}" mahsulotingiz qo'shildi!`);
      router.push(`/shops/${shopId}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/shops" className="text-blue-600 hover:underline font-medium">
            ← Orqaga
          </Link>
          <span className="text-xl font-bold text-gray-800">Sotuvchi Paneli</span>
        </div>
      </header>

      <ProtectedRoute shopRequired={true}> {/* ← YANGI QO'SHILDI */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Yangi Mahsulot Qo'shish
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Do'koningizga sotuvga chiqariladigan yangi tovarni kiriting
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Do'kon tanlash */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qaysi do'konga qo'shasiz? *
                </label>
                {isShopLocked ? (
                  // Do'kon ID saqlangan bo'lsa - o'qib bo'lmaydigan input
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {localStorage.getItem("currentShopName")} ({shopId})
                  </div>
                ) : (
                  // Do'kon ID saqlanmagan bo'lsa - oddiy select
                  <select
                    required
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Do'konni tanlang...</option>
                    <option value="tech-store">Texno Market</option>
                    <option value="fashion-hub">Fashion Hub</option>
                    <option value="sport-life">Sport Life</option>
                    <option value="super-market">Super Market</option>
                  </select>
                )}
              </div>

              {/* Mahsulot Nomi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Simsiz Quloqchin"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Narxi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narxi (so'm) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Masalan: 250000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rasm Linki */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rasm URL manzili *
                </label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Internetdan rasmning to'g'ridan-to'g'ri havolasini (link) olib tashlang.
                </p>
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulot haqida qisqacha
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mahsulotning afzalliklari haqida yozing..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tugmalar */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/shops")}
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
                  {loading ? "Qo'shilmoqda..." : "Mahsulotni Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ProtectedRoute> {/* ← YANGI QO'SHILDI */}
    </main>
  );
}