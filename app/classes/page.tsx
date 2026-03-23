"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, GraduationCap, UserX, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const revenueData = [
  { mois: "يناير", مداخيل: 4200 },
  { mois: "فبراير", مداخيل: 3800 },
  { mois: "مارس", مداخيل: 5100 },
  { mois: "أبريل", مداخيل: 4700 },
  { mois: "ماي", مداخيل: 5300 },
  { mois: "يونيو", مداخيل: 4900 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, absences: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: studentsCount } = await supabase
        .from("Students").select("*", { count: "exact", head: true });

      const { count: teachersCount } = await supabase
        .from("profiles").select("*", { count: "exact", head: true })
        .eq("role", "teacher");

      const today = new Date().toISOString().split("T")[0];
      const { count: absencesCount } = await supabase
        .from("absences").select("*", { count: "exact", head: true })
        .eq("date", today);

      setStats({
        students: studentsCount || 0,
        teachers: teachersCount || 0,
        absences: absencesCount || 0,
      });

      const { data: absData } = await supabase
        .from("absences").select("*").order("created_at", { ascending: false }).limit(5);

      setActivities(absData || []);
    };

    fetchStats();
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("ar-MA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ar-MA");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-bold">🏫 Skool Manager</h1>
            <p className="text-indigo-200 mt-1">مرحباً بك، المدير</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-sm">{formatDate(currentTime)}</p>
            <p className="text-white text-2xl font-bold">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <GraduationCap className="text-indigo-600 w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">إجمالي التلاميذ</p>
              <p className="text-3xl font-bold text-indigo-700">{stats.students}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="text-green-600 w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">الأساتذة</p>
              <p className="text-3xl font-bold text-green-700">{stats.teachers}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <UserX className="text-red-600 w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">غياب اليوم</p>
              <p className="text-3xl font-bold text-red-700">{stats.absences}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <TrendingUp className="text-yellow-600 w-7 h-7" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">مداخيل الشهر</p>
              <p className="text-3xl font-bold text-yellow-700">5,300 د</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-slate-700 text-right mb-4">📈 مقارنة المداخيل الشهرية</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="مداخيل" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-slate-700 text-right mb-4">🔔 آخر التنبيهات</h2>
            {activities.length === 0 ? (
              <p className="text-gray-400 text-center mt-8">لا تنبيهات حالياً</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 border-b pb-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <UserX className="text-red-500 w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">غياب مسجل</p>
                      <p className="text-xs text-gray-400">{a.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-slate-700 text-right mb-4">⚡ إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <a href="/students" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-4 rounded-xl text-center transition">
              👨‍🎓 التلاميذ
            </a>
            <a href="/absences" className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-4 rounded-xl text-center transition">
              📋 الغياب
            </a>
            <a href="/grades" className="bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 px-4 rounded-xl text-center transition">
              📊 النقط
            </a>
            <a href="/classes" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-3 px-4 rounded-xl text-center transition">
              🏫 الأقسام
            </a>
            <a href="/users" className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-3 px-4 rounded-xl text-center transition">
              👥 المستخدمين
            </a>
            <a href="/messages" className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl text-center transition">
              💬 الرسائل
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}