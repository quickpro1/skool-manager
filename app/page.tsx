"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("إيميل أو كلمة السر غلط!");
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">🏫 Skool Manager</h1>
          <p className="text-gray-500 mt-2">تسجيل الدخول</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="الإيميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition">
            دخول
          </button>
        </div>
      </div>
    </div>
  );
}