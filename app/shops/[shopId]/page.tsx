"use client";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, showToast, cartItems, setIsCartOpen, isCartOpen } = useCart();
  
  const [shop, setShop] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const shopId = params.shopId as string;

  useEffect(() => {
    async function fetchShopData() {
      // Do'kon ma'lumotlarini olish
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId)
        .single();

      if (shopError || !shopData) {
        console.error("Do'kon topilmadi:", shopError);
        setShop(null);
      } else {
        setShop(shopData);
      }

      // Do'kon mahsulotlarini olish
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId);

      if (productsError) {
        console.error("Mahsulotlar topilmadi:", productsError);
      } else {
        setShopProducts(productsData || []);
      }

      setLoading(false);
    }

    fetchShopData();
  }, [shopId]);

  const handleAddToCart = (product: any) => {
  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    priceText: product.price_text,
    image: product.image
  });
};

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

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Do'kon topilmadi 😔</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Do'kon Banneri */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{shop.logo}</span>
            <h1 className="text-4xl font-bold">{shop.name}</h1>
          </div>
          <p className="text-lg opacity-90">{shop.description}</p>
        </div>
      </div>

      {/* Mahsulotlar */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {shop.name} Mahsulotlari ({shopProducts.length})
        </h2>

        {shopProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <p className="text-gray-500 text-xl mb-4">Bu do'konda hali mahsulotlar yo'q 😔</p>
            <p className="text-gray-400">Sotuvchi tez orada mahsulot qo'shadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shopProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">
                <Link href={`/product/${product.id}`} className="block h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </Link>
                
                <div className="p-6">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">{product.price_text}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition"
                    >
                      Savatga
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Savat Toast */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Savatga qo'shildi!
        </div>
      )}
    </main>
  );
}