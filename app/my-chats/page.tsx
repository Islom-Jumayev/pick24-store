"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../seller/ProtectedRoute";

type Chat = {
  product_id: number;
  product_name: string;
  product_image: string;
  product_price: string;
  shop_id: string;
  shop_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

export default function MyChatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;

    setLoading(true);
    
    // Mijozning barcha xabarlarini olish
    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Xatolik:", error);
      setLoading(false);
      return;
    }

    // Mahsulot va do'kon ma'lumotlarini olish
    const chatsMap = new Map<number, Chat>();

    for (const msg of messagesData || []) {
      if (!chatsMap.has(msg.product_id)) {
        // Mahsulot ma'lumotlarini olish
        const { data: productData } = await supabase
          .from("products")
          .select("id, name, image, price_text, shop_id")
          .eq("id", msg.product_id)
          .single();

        if (productData) {
          // Do'kon nomini olish
          const { data: shopData } = await supabase
            .from("shops")
            .select("name")
            .eq("id", productData.shop_id)
            .single();

          // O'qilmagan xabarlarni hisoblash
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("product_id", msg.product_id)
            .eq("user_id", user.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          chatsMap.set(msg.product_id, {
            product_id: msg.product_id,
            product_name: productData.name,
            product_image: productData.image,
            product_price: productData.price_text,
            shop_id: productData.shop_id,
            shop_name: shopData?.name || "Do'kon",
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: unreadCount || 0
          });
        }
      }
    }

    setChats(Array.from(chatsMap.values()));
    setLoading(false);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">Pick24</Link>
          </div>
        </header>
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-gray-500 text-xl">Kirish kerak</p>
          <Link href="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Kirish
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              ← Bosh sahifaga
            </Link>
            <span className="text-xl font-bold text-gray-800">Mening Chatlarim</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mening Chatlarim
              </h1>
              <p className="text-gray-500">
                Sotuvchilar bilan yozishmalar ({chats.length} ta)
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500 text-xl mb-4">Hali chatlar yo'q</p>
                <p className="text-gray-400 mb-6">Mahsulot sotuvchisiga savol bering</p>
                <Link href="/shops" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Do'konlarni ko'rish
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat, index) => (
                  <Link
                    key={index}
                    href={`/chat/${chat.product_id}`}
                    className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <img 
                          src={chat.product_image} 
                          alt={chat.product_name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {chat.product_name}
                            </h3>
                            {chat.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {chat.unread_count} yangi
                              </span>
                            )}
                          </div>
                          <p className="text-blue-600 font-semibold text-sm mb-2">
                            {chat.product_price}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            🏪 {chat.shop_name}
                          </p>
                          <p className="text-gray-600 line-clamp-1">
                            {chat.last_message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-400">
                          {new Date(chat.last_message_time).toLocaleDateString("uz-UZ")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(chat.last_message_time).toLocaleTimeString("uz-UZ", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}