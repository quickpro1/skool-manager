"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, GraduationCap, UserX, TrendingUp, Search, Bell, BookOpen, MessageSquare, Settings, Sun, Moon } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? {
    bg: "#1a1f2e",
    card: {
      background: "#1a1f2e",
      boxShadow: "6px 6px 12px #0d1018, -6px -6px 12px #272e44",
      borderRadius: "20px",
    },
    inset: {
      background: "#1a1f2e",
      boxShadow: "inset 4px 4px 8px #0d1018, inset -4px -4px 8px #272e44",
      borderRadius: "16px",
    },
    button: {
      background: "#1a1f2e",
      boxShadow: "4px 4px 8px #0d1018, -4px -4px 8px #272e44",
      borderRadius: "14px",
    },
    buttonActive: {
      background: "#1a1f2e",
      boxShadow: "inset 4px 4px 8px #0d1018, inset -4px -4px 8px #272e44",
      borderRadius: "14px",
    },
    iconCircle: {
      background: "#1a1f2e",
      boxShadow: "inset 3px 3px 6px #0d1018, inset -3px -3px 6px #272e44",
      borderRadius: "50%",
    },
    text: "#e2e8f0",
    subtext: "#94a3b8",
  } : {
    bg: "#e0e5ec",
    card: {
      background: "#e0e5ec",
      boxShadow: "6px 6px 12px #b8bec7, -6px -6px 12px #ffffff",
      borderRadius: "20px",
    },
    inset: {
      background: "#e0e5ec",
      boxShadow: "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff",
      borderRadius: "16px",
    },
    button: {
      background: "#e0e5ec",
      boxShadow: "4px 4px 8px #b8bec7, -4px -4px 8px #ffffff",
      borderRadius: "14px",
    },
    buttonActive: {
      background: "#e0e5ec",
      boxShadow: "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff",
      borderRadius: "14px",
    },
    iconCircle: {
      background: "#e0e5ec",
      boxShadow: "inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff",
      borderRadius: "50%",
    },
    text: "#2d3748",
    subtext: "#718096",
  };

  const [pressedCard, setPressedCard] = useState<number | null>(null);
  const [pressedAction, setPressedAction] = useState<number | null>(null);

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
        .from("payments").select("montant, mois");
      const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0;
      const monthlyMap: { [key: string]: number } = {};
      paymentsData?.forEach(p => {
        const key = p.mois || "غير محدد";
        monthlyMap[key] = (monthlyMap[key] || 0) + (p.montant || 0);
      });
      const chartData = Object.entries(monthlyMap).map(([mois, amount]) => ({ mois, مداخيل: amount }));
      setRevenueData(chartData.length > 0 ? chartData : [
        { mois: "يناير", مداخيل: 0 },
        { mois: "فبراير", مداخيل: 0 },
        { mois: "مارس", مداخيل: 0 },
      ]);
      setStats({ students: studentsCount || 0, teachers: teachersCount || 0, absences: absencesCount || 0, revenue: totalRevenue });
      const { data: notifData } = await supabase
        .from("notifications").select("*")
        .order("created_at", { ascending: false }).limit(5);
      setNotifications(notifData || []);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      const { data } = await supabase
        .from("Students").select("*")
        .ilike("Nom", "%" + searchQuery + "%").limit(5);
      setSearchResults(data || []);
    };
    search();
  }, [searchQuery]);

  const formatTime = (date: Date) => date.toLocaleTimeString("ar-MA");
  const formatDate = (date: Date) => date.toLocaleDateString("ar-MA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const statsCards = [
    { label: "التلاميذ", value: stats.students, icon: <GraduationCap size={22} color="#5b6af5" />, color: "#5b6af5" },
    { label: "الأساتذة", value: stats.teachers, icon: <Users size={22} color="#22c55e" />, color: "#22c55e" },
    { label: "غياب اليوم", value: stats.absences, icon: <UserX size={22} color="#ef4444" />, color: "#ef4444" },
    { label: "المداخيل", value: stats.revenue + " د", icon: <TrendingUp size={22} color="#f59e0b" />, color: "#f59e0b" },
  ];

  const quickActions = [
    { label: "التلاميذ", href: "/students", icon: <GraduationCap size={20} color="#5b6af5" /> },
    { label: "الغياب", href: "/absences", icon: <UserX size={20} color="#ef4444" /> },
    { label: "النقط", href: "/grades", icon: <BookOpen size={20} color="#22c55e" /> },
    { label: "الأقسام", href: "/classes", icon: <Settings size={20} color="#f59e0b" /> },
    { label: "المستخدمين", href: "/users", icon: <Users size={20} color="#8b5cf6" /> },
    { label: "الرسائل", href: "/messages", icon: <MessageSquare size={20} color="#06b6d4" /> },
  ];

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: "sans-serif", transition: "all 0.3s" }} className="p-4 md:p-8">

      {/* Header */}
      <div style={{ ...theme.card, padding: "24px 32px", marginBottom: "28px", transition: "all 0.3s" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-right">
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: theme.text }}>🏫 Skool Manager</h1>
            <p style={{ color: theme.subtext, fontSize: "14px", marginTop: "4px" }}>مرحباً بك، المدير</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                ...theme.button,
                width: "52px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseDown={e => (e.currentTarget.style.boxShadow = darkMode
                ? "inset 4px 4px 8px #0d1018, inset -4px -4px 8px #272e44"
                : "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff")}
              onMouseUp={e => (e.currentTarget.style.boxShadow = darkMode
                ? "4px 4px 8px #0d1018, -4px -4px 8px #272e44"
                : "4px 4px 8px #b8bec7, -4px -4px 8px #ffffff")}
            >
              <div style={{ transition: "transform 0.4s", transform: darkMode ? "rotate(180deg)" : "rotate(0deg)" }}>
                {darkMode ? <Sun size={22} color="#f59e0b" /> : <Moon size={22} color="#5b6af5" />}
              </div>
            </button>
            <div className="text-right">
              <p style={{ color: theme.subtext, fontSize: "12px" }}>{formatDate(currentTime)}</p>
              <p style={{ color: theme.text, fontSize: "24px", fontWeight: "800" }}>{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginTop: "20px" }}>
          <div style={{ ...theme.inset, padding: "12px 16px 12px 44px", display: "flex", alignItems: "center", transition: "all 0.3s" }}>
            <Search size={18} color={theme.subtext} style={{ position: "absolute", left: "16px" }} />
            <input
              type="text"
              placeholder="ابحث عن تلميذ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: theme.text }}
            />
          </div>
          {searchResults.length > 0 && (
            <div style={{ ...theme.card, position: "absolute", top: "56px", right: 0, left: 0, zIndex: 50, padding: "8px" }}>
              {searchResults.map(s => (
                <div key={s.id} style={{ padding: "10px 16px", borderRadius: "12px", cursor: "pointer", textAlign: "right" }}>
                  <p style={{ fontWeight: "700", color: theme.text }}>{s.Nom} {s.Prenom}</p>
                  <p style={{ fontSize: "12px", color: theme.subtext }}>{s.Classe}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        {statsCards.map((card, i) => (
          <div
            key={i}
            style={{
              ...theme.card,
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: pressedCard === i
                ? (darkMode ? "inset 4px 4px 8px #0d1018, inset -4px -4px 8px #272e44" : "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff")
                : (darkMode ? "8px 8px 16px #0d1018, -8px -8px 16px #272e44" : "8px 8px 16px #b8bec7, -8px -8px 16px #ffffff"),
            }}
            onMouseDown={() => setPressedCard(i)}
            onMouseUp={() => setPressedCard(null)}
            onMouseLeave={() => setPressedCard(null)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px" }}>
              <div className="text-right">
                <p style={{ color: theme.subtext, fontSize: "12px", marginBottom: "4px" }}>{card.label}</p>
                <p style={{ fontSize: "28px", fontWeight: "800", color: card.color }}>{card.value}</p>
              </div>
              <div style={{ ...theme.iconCircle, width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        <div style={{ ...theme.card, padding: "24px", transition: "all 0.3s" }} className="lg:col-span-2">
          <h2 style={{ textAlign: "right", fontWeight: "700", color: theme.text, marginBottom: "20px" }}>📈 المداخيل الشهرية</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#2d3748" : "#d1d9e6"} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: theme.subtext }} />
              <YAxis tick={{ fontSize: 11, fill: theme.subtext }} />
              <Tooltip
                formatter={(value) => [value + " درهم", "المداخيل"]}
                contentStyle={{ borderRadius: "14px", border: "none", background: theme.bg, color: theme.text }}
              />
              <Bar dataKey="مداخيل" fill="#5b6af5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...theme.card, padding: "24px", transition: "all 0.3s" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: theme.text, marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
            آخر التنبيهات <Bell size={18} color="#5b6af5" />
          </h2>
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ ...theme.iconCircle, width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={24} color={theme.subtext} />
              </div>
              <p style={{ color: theme.subtext, fontSize: "13px" }}>لا توجد تنبيهات جديدة</p>
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {notifications.map(n => (
                <li key={n.id} style={{ ...theme.inset, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <p style={{ fontWeight: "700", fontSize: "13px", color: theme.text }}>{n.titre}</p>
                    <p style={{ fontSize: "11px", color: theme.subtext }}>{n.contenu}</p>
                  </div>
                  <span style={{ fontSize: "20px" }}>{n.type === "غياب" ? "🔴" : n.type === "دفع" ? "💰" : "🔔"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...theme.card, padding: "24px", transition: "all 0.3s" }}>
        <h2 style={{ textAlign: "right", fontWeight: "700", color: theme.text, marginBottom: "16px" }}>⚡ إجراءات سريعة</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickActions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              style={{
                ...theme.button,
                padding: "16px 8px",
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: pressedAction === i
                  ? (darkMode ? "inset 4px 4px 8px #0d1018, inset -4px -4px 8px #272e44" : "inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff")
                  : (darkMode ? "6px 6px 12px #0d1018, -6px -6px 12px #272e44" : "6px 6px 12px #b8bec7, -6px -6px 12px #ffffff"),
              }}
              onMouseDown={() => setPressedAction(i)}
              onMouseUp={() => setPressedAction(null)}
              onMouseLeave={() => setPressedAction(null)}
            >
              <div style={{ ...theme.iconCircle, width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {action.icon}
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.text }}>{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}