"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../ProtectedRoute";

type Message = {
  id: string;
  product_id: number;
  shop_id: string;
  user_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  product_name?: string;
  customer_name?: string;
};

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
    }
  }, []);

  useEffect(() => {
    if (shopId) {
      fetchMessages();
    }
  }, [shopId]);

  const fetchMessages = async () => {
    if (!shopId) return;

    setLoading(true);
    
    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Xatolik:", error);
      setLoading(false);
      return;
    }

    // Mahsulot nomlarini va mijoz ismlarini olish
    const messagesWithDetails = await Promise.all(
      (messagesData || []).map(async (msg) => {
        const { data: productData } = await supabase
          .from("products")
          .select("name")
          .eq("id", msg.product_id)
          .single();

        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("id", msg.user_id)
          .single();

        return {
          ...msg,
          product_name: productData?.name || "Mahsulot",
          customer_name: userData?.name || "Mijoz"
        };
      })
    );

    setMessages(messagesWithDetails);
    setLoading(false);
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
          <p className="text-gray-500 text-xl">Sizda do'kon yo'q</p>
        </div>
      </main>
    );
  }

  // Guruhlangan xabarlar (mahsulot bo'yicha)
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.product_id]) {
      acc[msg.product_id] = {
        product_id: msg.product_id,
        product_name: msg.product_name,
        customer_name: msg.customer_name,
        last_message: msg.message,
        last_message_time: msg.created_at,
        unread_count: messages.filter(m => 
          m.product_id === msg.product_id && 
          !m.is_read && 
          m.sender_id !== user?.id
        ).length
      };
    }
    return acc;
  }, {} as any);

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute shopRequired={true}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/seller" className="text-blue-600 hover:underline font-medium">
              ← Do'konim
            </Link>
            <span className="text-xl font-bold text-gray-800">Xabarlar</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mijozlar bilan Xabarlar
              </h1>
              <p className="text-gray-500">
                Mahsulotlar bo'yicha savollar va javoblar
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
              </div>
            ) : Object.keys(groupedMessages).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500 text-xl mb-4">Hali xabarlar yo'q</p>
                <p className="text-gray-400">Mijozlardan xabar kelganda shu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.values(groupedMessages).map((chat: any, index) => (
                  <Link
                    key={index}
                    href={`/seller/messages/${chat.product_id}`}
                    className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
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
                        <p className="text-sm text-gray-500 mb-2">
                          👤 {chat.customer_name}
                        </p>
                        <p className="text-gray-600 line-clamp-1">
                          {chat.last_message}
                        </p>
                      </div>
                      <div className="text-right">
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