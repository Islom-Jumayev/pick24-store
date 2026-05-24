"use client";
import { useState } from "react";

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false); // YANGI: Checkout oynasi

  const products = [
    { id: 1, name: "Simsiz Quloqchin", price: 250000, priceText: "250,000 so'm", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
    { id: 2, name: "Aqlli Soat", price: 450000, priceText: "450,000 so'm", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
    { id: 3, name: "Bluetooth Kolonka", price: 180000, priceText: "180,000 so'm", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60" },
    { id: 4, name: "Raqamli Kamera", price: 3200000, priceText: "3,200,000 so'm", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60" },
    { id: 5, name: "Mexanik Klaviatura", price: 350000, priceText: "350,000 so'm", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60" },
    { id: 6, name: "O'yin Pulti", price: 550000, priceText: "550,000 so'm", image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=60" },
  ];

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartCount(cartCount + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const formattedTotal = new Intl.NumberFormat('uz-UZ').format(totalPrice) + " so'm";

  // YANGI: Buyurtmani tasdiqlash
  const submitOrder = (e) => {
    e.preventDefault();
    alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! 🎉\nTez orada operatorlarimiz siz bilan bog'lanishadi.");
    setCartItems([]);
    setCartCount(0);
    setIsCartOpen(false);
    setShowCheckout(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 relative">
      
      {/* XABAR */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Savatga qo'shildi!
        </div>
      )}

      {/* SAVAT VA FON OYNASI */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
            onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}
          >
            <div className="text-center text-white animate-pulse">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Pick24</h2>
              <p className="text-xl md:text-2xl font-light">Tanlovingiz uchun rahmat! ✨</p>
              <p className="mt-2 text-sm opacity-70">Sizning didingiz ajoyib!</p>
            </div>
          </div>

          <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto z-50 flex flex-col p-6">
            
            {/* CHECKOUT FORMASI */}
            {showCheckout ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Buyurtma berish</h2>
                  <button onClick={() => setShowCheckout(false)} className="text-gray-500 hover:text-red-500 text-2xl">✕</button>
                </div>
                <form onSubmit={submitOrder} className="space-y-4 flex-grow">
                  <input required placeholder="Ismingiz" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input required type="tel" placeholder="Telefon raqam (+998...)" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input required placeholder="Yetkazib berish manzili" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <textarea placeholder="Qo'shimcha izoh (ixtiyoriy)" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"></textarea>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">Jami to'lov:</p>
                    <p className="text-xl font-bold text-blue-600">{formattedTotal}</p>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Tasdiqlash</button>
                </form>
                <button onClick={() => setShowCheckout(false)} className="mt-4 text-gray-500 hover:text-blue-600 font-medium">← Savatga qaytish</button>
              </div>
            ) : (
              /* SAVAT KO'RINISHI */
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Sizning Savatingiz</h2>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">✕</button>
                </div>
                
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Savat bo'sh </p>
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
                      <button 
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
                      >
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

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">Pick24</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600">Bosh sahifa</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Mahsulotlar</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Aksiyalar</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Aloqa</a>
            </nav>
            <div className="flex items-center space-x-4">
              <input 
                type="text"
                placeholder="Mahsulot qidirish..."
                className="bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 hidden sm:block"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <button className="text-gray-600 hover:text-blue-600 text-xl">🛒</button>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Kerakli narsani <br />
          <span className="text-blue-600">tez va oson</span> toping.
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
          Minimalistik dizayn, maksimal qulaylik. Pick24 orqali xaridlaringizni bir zumda amalga oshiring.
        </p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
          Xarid qilishni boshlash
        </button>
      </section>

      {/* MAHSULOTLAR */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Ommabop mahsulotlar
        </h2>
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Hech narsa topilmadi 😔</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-4">{product.priceText}</p>
                  <button onClick={() => addToCart(product)} className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-medium">
                    Savatga qo'shish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Pick24</h3>
              <p className="text-gray-400">Minimalistik online savdo platformasi. Tez, oson va qulay.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Havolalar</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400">Bosh sahifa</a></li>
                <li><a href="#" className="hover:text-blue-400">Mahsulotlar</a></li>
                <li><a href="#" className="hover:text-blue-400">Aksiyalar</a></li>
                <li><a href="#" className="hover:text-blue-400">Aloqa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Aloqa</h4>
              <ul className="space-y-2 text-gray-400">
                <li> +998 90 123 45 67</li>
                <li> info@pick24.uz</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 Pick24. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}