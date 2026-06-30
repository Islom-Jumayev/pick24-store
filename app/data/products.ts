// Mahsulotlar ro'yxati
export const products = [
  { 
    id: 1, 
    name: "Simsiz Quloqchin", 
    price: 250000, 
    priceText: "250,000 so'm", 
    description: "Yuqori sifatli ovoz, shovqinni bekor qilish funksiyasi.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    shopId: "tech-store",      // Do'kon IDsi
    shopName: "Texno Market"   // Do'kon nomi
  },
  { 
    id: 2, 
    name: "Aqlli Soat", 
    price: 450000, 
    priceText: "450,000 so'm", 
    description: "Yurak urishini o'lchash, suvga chidamli.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
    shopId: "tech-store",
    shopName: "Texno Market"
  },
  { 
    id: 3, 
    name: "Erkaklar Kurtkasi", 
    price: 350000, 
    priceText: "350,000 so'm", 
    description: "Qishki issiq kurtka, zamonaviy dizayn.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60",
    shopId: "fashion-hub",     // Boshqa do'kon
    shopName: "Fashion Hub"
  },
  { 
    id: 4, 
    name: "Sport Oyoq Kiyimi", 
    price: 280000, 
    priceText: "280,000 so'm", 
    description: "Yugurish uchun qulay, yengil material.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    shopId: "sport-life",      // Yana boshqa do'kon
    shopName: "Sport Life"
  },
];

// Do'konlar ro'yxati
export const shops = [
  { 
    id: "tech-store", 
    name: "Texno Market", 
    logo: "💻", 
    description: "Eng so'nggi gadjetlar va elektronika olami." 
  },
  { 
    id: "fashion-hub", 
    name: "Fashion Hub", 
    logo: "", 
    description: "Zamonaviy kiyim-kechak va aksessuarlar." 
  },
  { 
    id: "sport-life", 
    name: "Sport Life", 
    logo: "⚽", 
    description: "Faol hayot tarzi uchun sport anjomlari." 
  },
];