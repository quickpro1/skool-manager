"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, GraduationCap, UserX, TrendingUp, Search, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, absences: 0, revenue: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
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

      const { data: paymentsData } = await supabase
        .from("payments").select("montant, mois, annee");

      const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0;

      const monthlyMap: { [key: string]: number } = {};
      paymentsData?.forEach(p => {
        const key = p.mois || "غير محدد";
        monthlyMap[key] = (monthlyMap[key] || 0) + (p.montant || 0);
      });

      const chartData = Object.entries(monthlyMap).map(([mois, مداخيل]) => ({ mois, مداخيل }));

      if (chartData.length === 0) {
        setRevenueData([
          { mois: "يناير", مداخيل: 0 },
          { mois: "فبراير", مداخيل: 0 },
          { mois: "مارس", مداخيل: 0 },
        ]);
      } else {
        setRevenueData(chartData);
      }

      setStats({
        students: studentsCount || 0,
        teachers: teachersCount || 0,
        absences: absencesCount || 0,
        revenue: totalRevenue,
      });

      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setNotifications(notifData || []);
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const { data } = await supabase
        .from("Students")
        .select("*")
        .ilike("Nom", `%${searchQuery}%`)
        .limit(5);
      setSearchResults(data || []);
    };
    search();
  }, [searchQuery]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("ar-MA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ar-MA");

  const getNotifIcon = (type: string) => {
    if (type === "غياب") return "🔴";
    if (type === "دفع") return "💰";
    if (type === "رسالة") return "💬";
    return "🔔";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-right">
              <h1 className="text-2xl font-bold">🏫 Skool Manager</h1>
              <p className="text-indigo-200 text-sm mt-1">مرحباً بك، المدير</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-xs">{formatDate(currentTime)}</p>
              <p className="text-white text-xl font-bold">{formatTime(currentTime)}</p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن تلميذ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 rounded-xl px-4 py-2 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-12 right-0 left-0 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                {searchResults.map(s => (
                  <div key={s.id} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-right border-b">
                    <p className="font-bold text-slate-700">{s.Nom} {s.Prenom}</p>
                    <p className="text-sm text-gray-400">{s.Classe}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <GraduationCap className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">التلاميذ</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.students}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="text-green-600 w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">الأساتذة</p>
              <p className="text-2xl font-bold text-green-700">{stats.teachers}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl">
              <UserX className="text-red-600 w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">غياب اليوم</p>
              <p className="text-2xl font-bold text-red-700">{stats.absences}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <TrendingUp className="text-yellow-600 w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">المداخيل</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.revenue} د</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-slate-700 text-right mb-4">📈 المداخيل الشهرية</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} درهم`, "المداخيل"]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="مداخيل" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-slate-700 text-right mb-4 flex items-center justify-end gap-2">
              <span>آخر التنبيهات</span>
              <Bell className="w-5 h-5 text-indigo-500" />
            </h2>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Bell className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">لا توجد تنبيهات جديدة</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 border-b pb-3">
                    <span className="text-xl">{getNotifIcon(n.type)}</span>
                    <div className="text-right flex-1">
                      <p className="text-sm font-bold text-slate-700">{n.titre}</p>
                      <p className="text-xs text-gray-400">{n.contenu}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.created_at).toLocaleDateString("ar-MA")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-slate-700 text-right mb-4">⚡ إجراءات سريعة</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <a href="/students" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              👨‍🎓 التلاميذ
            </a>
            <a href="/absences" className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              📋 الغياب
            </a>
            <a href="/grades" className="bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              📊 النقط
            </a>
            <a href="/classes" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              🏫 الأقسام
            </a>
            <a href="/users" className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              👥 المستخدمين
            </a>
            <a href="/messages" className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-2 rounded-xl text-center transition text-sm">
              💬 الرسائل
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}