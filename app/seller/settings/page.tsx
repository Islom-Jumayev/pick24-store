"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";
import ImageUpload from "../../components/ImageUpload";

export default function ShopSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    logo_url: "",
    banner_url: ""
  });

  useEffect(() => {
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const fetchShopData = async () => {
    if (!user) return;

    // localStorage'dan joriy do'kon ID'sini olish
    const savedShopId = localStorage.getItem("currentShopId");
    
    let query;
    if (savedShopId) {
      // Agar localStorage'da bo'lsa, shu do'konni olish
      query = supabase
        .from("shops")
        .select("*")
        .eq("id", savedShopId)
        .eq("user_id", user.id)
        .single();
    } else {
      // Yo'q bo'lsa, foydalanuvchining birinchi do'konini olish
      query = supabase
        .from("shops")
        .select("*")
        .eq("user_id", user.id)
        .single();
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error("Do'kon topilmadi:", error);
      setMessage("⚠️ Do'kon topilmadi. Iltimos, do'kon oching.");
    } else {
      setFormData({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || ""
      });
      localStorage.setItem("currentShopId", data.id);
      localStorage.setItem("currentShopName", data.name);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const shopId = localStorage.getItem("currentShopId");
    if (!shopId) {
      setMessage("Do'kon topilmadi");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("shops")
      .update({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url
      })
      .eq("id", shopId);

    if (error) {
      setMessage("Xatolik: " + error.message);
    } else {
      setMessage("✅ Sozlamalar saqlandi!");
      localStorage.setItem("currentShopName", formData.name);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute shopRequired={true}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/seller" className="text-blue-600 hover:underline font-medium">
              ← Orqaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Do'kon Sozlamalari</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Do'kon Ma'lumotlarini Tahrirlash
            </h1>
            <p className="text-gray-500 mb-8">
              Do'koningiz ma'lumotlarini yangilang
            </p>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
              {/* Do'kon nomi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do'kon nomi *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masalan: TechStore"
                />
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do'kon haqida
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Do'koningiz haqida qisqacha ma'lumot..."
                />
              </div>

              {/* Manzil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manzil
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Toshkent shahri, Chilonzor tumani"
                />
              </div>

              {/* Telefon va Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon raqami
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@shop.uz"
                  />
                </div>
              </div>

              {/* Logo - YANGILANDI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do'kon logotipi
                </label>
                <ImageUpload
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  folder="shop-logos"
                  recommendedSize="400x400 px (kvadrat)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Maslahat: Kvadrat shakldagi rasmlar (400x400 yoki 512x512) eng yaxshi ko'rinadi
                </p>
              </div>

              {/* Banner - YANGILANDI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do'kon banneri
                </label>
                <ImageUpload
                  value={formData.banner_url}
                  onChange={(url) => setFormData({ ...formData, banner_url: url })}
                  folder="shop-banners"
                  recommendedSize="1920x400 px (keng format)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Maslahat: Keng formatdagi rasmlar (1920x400, 1200x300 yoki 1600x400) tavsiya etiladi
                </p>
              </div>

              {/* Tugmalar */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <Link
                  href="/seller"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition text-center"
                >
                  Bekor qilish
                </Link>
              </div>
            </form>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}