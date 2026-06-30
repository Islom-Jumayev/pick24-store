"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  price_text: string;
  description: string;
  image: string;
  shop_id: string;
  created_at: string;
};

type Shop = {
  id: string;
  name: string;
  description: string;
  logo: string;
  user_id: string;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, showToast, isCartOpen, setIsCartOpen, cartItems } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const productId = parseInt(params.id as string);
      
      // Mahsulotni olish
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        console.error("Mahsulot topilmadi:", productError);
        setError(true);
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Do'kon ma'lumotlarini olish
      if (productData.shop_id) {
        const { data: shopData } = await supabase
          .from("shops")
          .select("*")
          .eq("id", productData.shop_id)
          .single();

        if (shopData) {
          setShop(shopData);
        }
      }
    } catch (err) {
      console.error("Xatolik:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        priceText: product.price_text,
        image: product.image,
        description: product.description,
        shop_id: product.shop_id
      });
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const formattedTotal = new Intl.NumberFormat("uz-UZ").format(totalPrice) + " so'm";

  const submitOrder = (e: any) => {
    e.preventDefault();
    alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! 🎉\nTez orada operatorlarimiz siz bilan bog'lanishadi.");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Mahsulot topilmadi </h1>
            <button onClick={() => router.push("/")} className="mt-4 text-blue-600 hover:underline">Bosh sahifaga qaytish</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {showToast && (
        <div className="fixed top-24 right-1/2 transform translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ {product.name} savatga qo'shildi!
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsCartOpen(false)}
          >
            <div className="text-center text-white animate-pulse">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Pick24</h2>
              <p className="text-xl md:text-2xl font-light">Tanlovingiz uchun rahmat! ✨</p>
            </div>
          </div>

          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto z-50 flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sizning Savatingiz</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">✕</button>
            </div>
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">Savat bo'sh</p>
            ) : (
              <>
                <div className="space-y-4 flex-grow">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border-b pb-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-blue-600">{item.priceText}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Jami:</span>
                    <span className="text-2xl font-bold text-blue-600">{formattedTotal}</span>
                  </div>
                  <button onClick={submitOrder} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                    Buyurtma berish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => router.push("/")} className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition font-medium">
          ← Bosh sahifaga qaytish
        </button>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="h-80 md:h-full bg-gray-100 flex items-center justify-center p-8">
              <img src={product.image} alt={product.name} className="max-h-full object-contain hover:scale-105 transition duration-500" />
            </div>
            
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Do'kon ma'lumoti */}
              {shop && (
                <Link href={`/shops/${shop.id}`} className="inline-flex items-center gap-2 mb-4 text-sm text-blue-600 hover:underline">
                  <span>🏪</span>
                  <span>{shop.name}</span>
                </Link>
              )}

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description || "Tavsif mavjud emas"}
              </p>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold text-blue-600">{product.price_text}</span>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  Savatga qo'shish
                </button>
              </div>

              {/* Chat tugmasi */}
              {user && (
                <Link 
                  href={`/chat/${product.id}`}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-center hover:bg-gray-200 transition"
                >
                  💬 Sotuvchiga savol berish
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}