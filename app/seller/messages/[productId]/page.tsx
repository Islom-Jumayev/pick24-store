"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import ProtectedRoute from "../../ProtectedRoute";

type Message = {
  id: string;
  product_id: number;
  shop_id: string;
  user_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  price_text: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function SellerChatPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedShopId = localStorage.getItem("currentShopId");
    if (savedShopId) {
      setShopId(savedShopId);
    }
  }, []);

    useEffect(() => {
    if (user && shopId && productId) {
      fetchProduct();
      fetchMessages();
    }
    
    // Real-time subscription - yangi xabarlarni tinglash
    const channel = supabase
      .channel(`seller-chat-${productId}`)
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
  }, [user, shopId, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error || !data) {
      alert("Mahsulot topilmadi");
      router.push("/seller/messages");
    } else {
      setProduct(data);
      fetchCustomer();  // ← user_id kerak emas
    }
  };

    const fetchCustomer = async () => {
    if (!user) return;  // ← user null bo'lsa chiqish
    
    // Mahsulotga birinchi xabar yuborgan mijozni topish
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .select("user_id")
      .eq("product_id", parseInt(productId))
      .eq("shop_id", shopId)
      .neq("sender_id", user.id)  // Sotuvchi emas
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    
    if (messageData && messageData.user_id) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", messageData.user_id)
        .single();
      
      if (userData && !userError) {
        setCustomer(userData);
      }
    }
  };

  const fetchMessages = async () => {
    if (!user || !shopId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("product_id", parseInt(productId))
      .eq("shop_id", shopId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Xatolik:", error);
    } else {
      setMessages(data || []);
      
      // O'qilmagan xabarlarni o'qilgan deb belgilash
      await markAsRead(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (msgs: Message[]) => {
    if (!user) return;
    
    const unreadMessages = msgs.filter(m => 
      m.sender_id !== user?.id && !m.is_read
    );

    if (unreadMessages.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadMessages.map(m => m.id));
    }
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !product || !shopId) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        product_id: parseInt(productId),
        shop_id: shopId,
        user_id: customer?.id,
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

  if (!user || !shopId || !product) {
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
      <ProtectedRoute shopRequired={true}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/seller/messages" className="text-blue-600 hover:underline font-medium">
              ← Xabarlarga qaytish
            </Link>
            <span className="text-xl font-bold text-gray-800">Chat</span>
            <div></div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Mahsulot va mijoz ma'lumotlari */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                    <p className="text-blue-600 font-bold text-lg">{product.price_text}</p>
                  </div>
                </div>
                {customer && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Mijoz</p>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat oynasi */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Xabarlar */}
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Hali xabarlar yo'q</p>
                    <p className="text-sm">Mijozdan xabar kelganda shu yerda ko'rinadi</p>
                  </div>
                ) : (
                 <div className="space-y-4">
  {messages.map((msg) => {
    // Sotuvchi chatida: sotuvchi = o'ngda ko'k, mijoz = chapda yashil
    const isSeller = msg.sender_id === user.id;
    return (
      <div key={msg.id} className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}>
        {/* Kim yozganini ko'rsatish */}
        <p className={`text-xs text-gray-500 mb-1 px-2 ${isSeller ? "text-right" : "text-left"}`}>
          {isSeller ? "🏪 Siz (Sotuvchi)" : "👤 Mijoz"}
        </p>
        <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
            isSeller 
              ? "bg-blue-600 text-white rounded-br-none" 
              : "bg-green-500 text-white rounded-bl-none"
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
                    placeholder="Javob yozing..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Yuborish
                  </button>
                </div>
              </form>
            </div>

            {/* Tezkor javoblar */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Tezkor javoblar:</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setNewMessage("Ha, mahsulot mavjud. Buyurtma berishingiz mumkin.")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  ✅ Mahsulot mavjud
                </button>
                <button 
                  onClick={() => setNewMessage("Mahsulot 1-2 kun ichida yetkaziladi.")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  🚚 Yetkazilish muddati
                </button>
                <button 
                  onClick={() => setNewMessage("Ha, albatta. Mahsulotni qaytarish mumkin.")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  🔄 Qaytarish shartlari
                </button>
                <button 
                  onClick={() => setNewMessage("Batafsil ma'lumot uchun telefon orqali bog'laning: +998 90 123 45 67")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  📞 Telefon raqam
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}