"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      const { data, error } = await supabase
        .from("shops")
        .select("*");
      
      if (error) {
        console.error("Xatolik:", error);
      } else {
        setShops(data || []);
      }
      setLoading(false);
    }
    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bizning Do'konlar
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Eng ishonchli sotuvchilar va ularning mahsulotlarini bir joyda kashf eting.
          </p>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">Hozircha do'konlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-8 text-center">
                <div className="text-6xl mb-4">{shop.logo}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{shop.description}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/shops/${shop.id}`} 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Do'konni ko'rish →
                  </Link>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Do'kon ochish CTA */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O'z do'koningizni ochmoqchimisiz?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Pick24 platformasida o'z biznesingizni rivojlantiring. Minglab mijozlar sizni kutmoqda!
          </p>
          <Link 
            href="/seller/register" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Do'kon Ochish
          </Link>
        </div>
      </div>
    </main>
  );
}