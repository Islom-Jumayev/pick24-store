"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ProtectedRoute from "../ProtectedRoute";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("🏪");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    // Do'kon ID yaratish (kichik harflar va tire bilan)
    const shopId = shopName.toLowerCase().replace(/\s+/g, "-");
    
    // Bazaga do'kon qo'shish (user_id bilan)
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("shops")
      .insert([
        { 
          id: shopId, 
          name: shopName, 
          description: description, 
          logo: logo,
          user_id: user?.id // ← YANGI QO'SHILDI
        }
      ]);
    
    if (error) {
      alert("Xatolik yuz berdi: " + error.message);
      setLoading(false);
    } else {
      // Do'kon ID'ni saqlash (sodda usul)
      localStorage.setItem("currentShopId", shopId);
      localStorage.setItem("currentShopName", shopName);
      
      alert(`Tabriklaymiz! 🎉\n"${shopName}" do'koningiz muvaffaqiyatli ochildi!\n\nEndi mahsulotlaringizni qo'sha olasiz.`);
      router.push(`/seller/add-product`);
    }
  };

  const emojis = ["🏪", "💻", "👗", "⚽", "🍕", "📱", "👟", ""];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">Pick24</Link>
        </div>
      </header>

      <ProtectedRoute> {/* ← YANGI QO'SHILDI */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Do'kon Ochish
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Pick24 platformasida o'z biznesingizni boshlang
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Do'kon nomi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do'kon nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Masalan: Texno Market"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Logo tanlash */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do'kon logotipi
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setLogo(emoji)}
                        className={`text-3xl p-3 rounded-lg border-2 transition ${
                          logo === emoji
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tavsif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do'kon haqida qisqacha *
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masalan: Eng so'nggi gadjetlar va elektronika olami."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tugmalar */}
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
                    {loading ? "Yaratilmoqda..." : "Do'kon Ochish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </ProtectedRoute> {/* ← YANGI QO'SHILDI */}
    </main>
  );
}