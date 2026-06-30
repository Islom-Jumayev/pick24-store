"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === "Invalid login credentials" 
        ? "Email yoki parol noto'g'ri" 
        : error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-blue-600">Pick24</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Kirish</h1>
            <p className="text-gray-500 mt-1">Hisobingizga kiring</p>
          </div>

          {/* Xato xabari */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolni kiriting"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

                    <div className="space-y-3">
            <p className="text-center text-gray-500 text-sm">
              Hisobingiz yo'qmi?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Ro'yxatdan o'ting
              </Link>
            </p>
            <p className="text-center text-sm">
              <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                Parolni unutdingizmi?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}