"use client";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import Header from "./components/Header";
import { useState, useEffect } from "react";

export default function Home() {
  const { cartItems, cartCount, addToCart, removeFromCart, decreaseQuantity, clearCart, showToast, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bazadan mahsulotlarni yuklash
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*");
      
      if (error) {
        console.error("Xatolik:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => addToCart(product);

  const totalPrice = cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  const formattedTotal = new Intl.NumberFormat("uz-UZ").format(totalPrice) + " so'm";

  const submitOrder = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;

    // Savatdagi barcha mahsulotlarning shop_id larini tekshirish
    const shopIds = [...new Set(cartItems.map((item: any) => item.shop_id))];

    if (shopIds.length === 0) {
      alert("Xatolik: Do'kon topilmadi");
      setSubmitting(false);
      return;
    }

    // Har bir do'kon uchun alohida buyurtma yaratish
    for (const shopId of shopIds) {
      const shopItems = cartItems.filter((item: any) => item.shop_id === shopId);
      const shopTotal = shopItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

      // Buyurtma yaratish
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id || null,
            shop_id: shopId,
            total_price: shopTotal,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            status: "pending"
          }
        ])
        .select()
        .single();

      if (orderError) {
        alert("Xatolik: " + orderError.message);
        setSubmitting(false);
        return;
      }

      // Buyurtma mahsulotlarini saqlash
      const orderItems = shopItems.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        image: item.image
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Mahsulotlarda xatolik:", itemsError.message);
      }
    }

    alert("✅ Buyurtmangiz muvaffaqiyatli qabul qilindi!");
    setSubmitting(false);
    clearCart();
    setIsCartOpen(false);
    setShowCheckout(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <main className="min-h-screen bg-gray-50 relative">
      <Header />
      
      {/* Xabar (Toast) */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✅ Savatga qo'shildi!
        </div>
      )}

            {/* Savat Oynasi */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Qora fon (overlay) */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity flex items-center justify-center"
            onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}
          >
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Pick24</h2>
              <p className="text-xl md:text-2xl font-light">Tanlovingiz uchun rahmat!</p>
            </div>
          </div>
          
          {/* Savat oynasi */}
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto z-50 flex flex-col p-6">
            {showCheckout ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Buyurtma berish</h2>
                  <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-red-500 text-2xl">×</button>
                </div>
                <form onSubmit={submitOrder} className="space-y-4 flex-grow">
                  <input 
                    name="customerName"
                    required 
                    placeholder="Ismingiz" 
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <input 
                    name="customerPhone"
                    required 
                    type="tel" 
                    placeholder="Telefon (+998...)" 
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <input 
                    name="customerAddress"
                    required 
                    placeholder="Manzil" 
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">Jami:</p>
                    <p className="text-xl font-bold text-blue-600">{formattedTotal}</p>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      submitting 
                        ? "bg-gray-400 cursor-not-allowed text-white" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? "Yuborilmoqda..." : "Tasdiqlash"}
                  </button>
                </form>
                <button onClick={() => setShowCheckout(false)} className="mt-4 text-gray-500 hover:text-blue-600">← Savatga qaytish</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Sizning Savatingiz</h2>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">×</button>
                </div>
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Savat bo'sh</p>
                ) : (
                  <>
                    <div className="space-y-4 flex-grow">
                      {cartItems.map((item: any, index: number) => (
  <div key={index} className="flex items-center gap-4 border-b border-gray-200 pb-4">
    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
    <div className="flex-1">
      <h4 className="font-semibold text-gray-800">{item.name}</h4>
      <p className="text-blue-600 font-medium">{item.price_text}</p>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => decreaseQuantity(index)}
          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full text-lg font-bold transition"
        >
          −
        </button>
        <span className="text-sm font-semibold text-gray-700 min-w-[20px] text-center">
          {item.quantity || 1}
        </span>
        <button
          onClick={() => addToCart(item)}
          className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-bold transition"
        >
          +
        </button>
      </div>
    </div>
    <button
      onClick={() => removeFromCart(index)}
      className="text-gray-400 hover:text-red-500 text-2xl px-2 transition"
      title="O'chirish"
    >
      ×
    </button>
  </div>
))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-700">Jami:</span>
                        <span className="text-2xl font-bold text-blue-600">{formattedTotal}</span>
                      </div>
                      <button onClick={() => setShowCheckout(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        Buyurtma berish
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

            {/* Hero Section */}
      {!isCartOpen && (
        <section className="bg-blue-600 text-white py-20 text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Pick24 ga Xush Kelibsiz!
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
              Sevimli mahsulotlaringizni toping va uyingizga buyurtma bering.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/shops" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                Do'konlarni Ko'rish
              </Link>
              <Link href="/seller/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 transition">
                Do'kon Ochish
              </Link>
            </div>
          </div>
        </section>
      )}

            {/* Mahsulotlar Bo'limi */}
      {!isCartOpen && (
        <section className="container mx-auto px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Barcha Mahsulotlar</h2>
            
            {/* Qidiruv */}
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              className="bg-white border border-gray-300 rounded-full px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 hidden sm:block"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500 text-xl">Hech narsa topilmadi 😔</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden group flex flex-col h-full relative">
                  
                  {/* Rasm va Yorliq Qismi */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <Link href={`/product/${product.id}`} className="block w-full h-full">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </Link>
                    
                    {/* DO'KON YORLIG'I - BOSILADIGAN LINK QILINDI */}
                    <Link 
                      href={`/shops/${product.shop_id}`} 
                      className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-bold shadow-lg z-50 flex items-center gap-1 transition-colors"
                    >
                      🏪 {product.shop_id}
                    </Link>
                  </div>
                  
                  {/* Ma'lumotlar Qismi */}
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1 hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-blue-600 font-medium mb-2">
                      🏪 {product.shop_id}
                    </p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
  <span className="text-blue-600 font-bold text-lg">{product.price_text}</span>
  {(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    const quantity = cartItem?.quantity || 0;
    
    if (quantity > 0) {
      // Mahsulot savatda - son ko'rsatish
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => decreaseQuantity(cartItems.findIndex((item) => item.id === product.id))}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-bold transition"
          >
            −
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[20px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => addToCart(product)}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-bold transition"
          >
            +
          </button>
        </div>
      );
    } else {
      // Mahsulot savatda yo'q - "Savatga" tugmasi
      return (
        <button
          onClick={() => handleAddToCart(product)}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-medium text-sm"
        >
          Savatga
        </button>
      );
    }
  })()}
</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="bg-gray-900 text-white py-12 mt-20 text-center">
        <p>© 2026 Pick24. Barcha huquqlar himoyalangan.</p>
      </footer>
    </main>
  );
}