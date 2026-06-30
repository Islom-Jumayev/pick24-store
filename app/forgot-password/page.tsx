"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Parolni tiklash linki emailingizga yuborildi! Iltimos, pochtangizni tekshiring.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-blue-600">Pick24</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Parolni tiklash</h1>
            <p className="text-gray-500 mt-1">Emailingizni kiriting, biz sizga link yuboramiz</p>
          </div>

          {/* Xabar */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
              ✅ {message}
            </div>
          )}

          {/* Xato */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
               {error}
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Yuborilmoqda..." : "Tiklash linkini yuborish"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Parolni eslayapsizmi?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}