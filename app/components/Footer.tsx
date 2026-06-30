import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Asosiy qism */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kompaniya haqida */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Pick24</h3>
            <p className="text-sm leading-relaxed mb-4">
              O'zbekistondagi eng yirik online savdo platformasi. Sifatli mahsulotlar, 
              qulay narxlar va tez yetkazib berish xizmati.
            </p>
            {/* Ijtimoiy tarmoqlar */}
            <div className="flex gap-3">
              <a 
                href="https://t.me/Pick24_uz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/pick24.uz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com/pick24" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Foydali havolalar */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kompaniya</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Aloqa
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition">
                  Yetkazib berish
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Ko'p beriladigan savollar
                </Link>
              </li>
            </ul>
          </div>

          {/* Mijozlar uchun */}
          <div>
            <h4 className="text-white font-semibold mb-4">Mijozlar uchun</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/my-orders" className="hover:text-white transition">
                  Buyurtmalarim
                </Link>
              </li>
              <li>
                <Link href="/my-chats" className="hover:text-white transition">
                  Chatlarim
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-white transition">
                  Do'konim
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-white transition">
                  Do'konlar
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-white transition">
                  Aksiyalar
                </Link>
              </li>
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h4 className="text-white font-semibold mb-4">Aloqa</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lg">📱</span>
                <div>
                  <p className="font-medium text-white">+998 50 720 04 51</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-medium text-white">info@pick24.uz</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* To'lov tizimlari */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">To'lov usullari:</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-2 rounded text-xs font-bold text-gray-900">
                Click
              </div>
              <div className="bg-white px-3 py-2 rounded text-xs font-bold text-gray-900">
                Payme
              </div>
              <div className="bg-white px-3 py-2 rounded text-xs font-bold text-gray-900">
                Visa
              </div>
              <div className="bg-white px-3 py-2 rounded text-xs font-bold text-gray-900">
                MasterCard
              </div>
              <div className="bg-white px-3 py-2 rounded text-xs font-bold text-gray-900">
                Humo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yuridik ma'lumotlar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/privacy" className="hover:text-white transition">
                Maxfiylik siyosati
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="hover:text-white transition">
                Foydalanish shartlari
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/cookies" className="hover:text-white transition">
                Cookie siyosati
              </Link>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              © 2026 Pick24. Barcha huquqlar himoyalangan.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}