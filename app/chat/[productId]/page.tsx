"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../seller/ProtectedRoute";

type Message = {
  id: string;
  product_id: string;
  shop_id: string;
  user_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  price_text: string;
  shop_id: string;
};

type Shop = {
  id: string;
  name: string;
};

export default function ChatPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    if (user && productId) {
      fetchProduct();
      fetchMessages();
    }
    
    // Real-time subscription - yangi xabarlarni tinglash
    const channel = supabase
      .channel(`chat-${productId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `product_id=eq.${productId}`
        }, 
        (payload) => {
          console.log('Yangi xabar:', payload);
          fetchMessages(); // Yangi xabarlarni yuklash
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [user, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Har 3 sekundda yangi xabarlarni tekshirish
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [user, product]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, image, price, price_text, shop_id")
      .eq("id", productId)
      .single();

    if (error || !data) {
      alert("Mahsulot topilmadi");
      router.push("/shops");
    } else {
      setProduct(data);
      // Do'kon nomini ham olish
      const { data: shopData } = await supabase
        .from("shops")
        .select("id, name")
        .eq("id", data.shop_id)
        .single();
      if (shopData) {
        setShop(shopData);
      }
    }
  };

  const fetchMessages = async () => {
    if (!user || !product) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !product) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        product_id: productId,
        shop_id: product.shop_id,
        user_id: user.id,
        sender_id: user.id,
        message: newMessage.trim(),
        is_read: false
      });

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      setNewMessage("");
      fetchMessages();
    }
  };

  if (!user || !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProtectedRoute>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href={`/shops/${product.shop_id}`} className="text-blue-600 hover:underline font-medium">
              ← Do'konga qaytish
            </Link>
            <span className="text-xl font-bold text-gray-800">Chat</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Mahsulot ma'lumotlari */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                  <p className="text-blue-600 font-bold text-lg">{product.price_text}</p>
                  {shop && (
                    <p className="text-sm text-gray-500 mt-1">🏪 {shop.name} bilan suhbat</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chat oynasi */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Xabarlar */}
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-5xl mb-2">💬</p>
                    <p>Hali xabarlar yo'q</p>
                    <p className="text-sm">Birinchi xabaringizni yuboring!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      // Mijozning o'z xabari = o'ngda yashil
                      // Sotuvchining javobi = chapda ko'k
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          {/* Kim yozganini ko'rsatish */}
                          <p className={`text-xs text-gray-500 mb-1 px-2 ${isMe ? "text-right" : "text-left"}`}>
                            {isMe ? "👤 Siz (Mijoz)" : "🏪 Sotuvchi"}
                          </p>
                          <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                              isMe 
                                ? "bg-green-500 text-white rounded-br-none" 
                                : "bg-blue-600 text-white rounded-bl-none"
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <p className="text-xs mt-1 text-white/70 text-right">
                                {new Date(msg.created_at).toLocaleTimeString("uz-UZ", { 
                                  hour: "2-digit", 
                                  minute: "2-digit" 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Xabar yuborish formasi */}
              <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Xabaringizni yozing..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Yuborish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}