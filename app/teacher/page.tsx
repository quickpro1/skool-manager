"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Teacher() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">👨‍🏫 لوحة الأستاذ</h1>
        <span className="text-green-200">{user?.email}</span>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/absences" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">📋</div>
          <h2 className="text-xl font-bold text-green-700">الغياب</h2>
          <p className="text-gray-500 mt-1">تسجيل الغياب</p>
        </a>
        <a href="/grades" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-xl font-bold text-green-700">النقط</h2>
          <p className="text-gray-500 mt-1">إدخال النقط</p>
        </a>
      </div>
    </div>
  );
}