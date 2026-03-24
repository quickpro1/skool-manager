"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, GraduationCap, UserX, TrendingUp, Search, Bell, BookOpen, MessageSquare, Settings, Sun, Moon, Languages, CheckCircle, XCircle, AlertCircle, ChevronDown, DollarSign, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const monthNames: Record<string, Record<string, string>> = {
  ar: { "يناير": "يناير", "فبراير": "فبراير", "مارس": "مارس", "أبريل": "أبريل", "ماي": "ماي", "يونيو": "يونيو", "يوليوز": "يوليوز", "غشت": "غشت", "شتنبر": "شتنبر", "أكتوبر": "أكتوبر", "نونبر": "نونبر", "دجنبر": "دجنبر" },
  fr: { "يناير": "Jan", "فبراير": "Fév", "مارس": "Mar", "أبريل": "Avr", "ماي": "Mai", "يونيو": "Juin", "يوليوز": "Juil", "غشت": "Aoû", "شتنبر": "Sep", "أكتوبر": "Oct", "نونبر": "Nov", "دجنبر": "Déc" },
  en: { "يناير": "Jan", "فبراير": "Feb", "مارس": "Mar", "أبريل": "Apr", "ماي": "May", "يونيو": "Jun", "يوليوز": "Jul", "غشت": "Aug", "شتنبر": "Sep", "أكتوبر": "Oct", "نونبر": "Nov", "دجنبر": "Dec" },
};

const currencyLabel: Record<string, string> = { ar: "درهم", fr: "MAD", en: "MAD" };

export default function Dashboard() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [stats, setStats] = useState({ students: 0, teachers: 0, absences: 0, revenue: 0 });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [pressedCard, setPressedCard] = useState<number | null>(null);
  const [pressedAction, setPressedAction] = useState<number | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [showLang, setShowLang] = useState(false);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const currency = currencyLabel[lang] || "درهم";

  const langs = [
    { code: "ar", short: "AR" },
    { code: "fr", short: "FR" },
    { code: "en", short: "EN" },
  ];

  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => {
      const now = new Date();
      const localeMap: Record<string, string> = { ar: "ar-MA", fr: "fr-FR", en: "en-US" };
      setCurrentTime(now.toLocaleTimeString(localeMap[lang]));
      setCurrentDate(now.toLocaleDateString(localeMap[lang], { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  useEffect(() => {
    const fetchAll = async () => {
      const { count: studentsCount } = await supabase.from("Students").select("*", { count: "exact", head: true });
      const { count: teachersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher");
      const today = new Date().toISOString().split("T")[0];
      const { count: absencesCount } = await supabase.from("absences").select("*", { count: "exact", head: true }).eq("date", today);
      const { data: paymentsData } = await supabase.from("payments").select("*");
      const { data: studentsData } = await supabase.from("Students").select("*");
      const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0;
      const monthlyMap: { [key: string]: number } = {};
      paymentsData?.forEach(p => { const key = p.mois || "—"; monthlyMap[key] = (monthlyMap[key] || 0) + (p.montant || 0); });
      const chartData = Object.entries(monthlyMap).map(([mois, amount]) => ({ mois, مداخيل: amount }));
      setRevenueData(chartData.length > 0 ? chartData : [{ mois: "يناير", مداخيل: 0 }, { mois: "فبراير", مداخيل: 0 }, { mois: "مارس", مداخيل: 0 }]);
      setStats({ students: studentsCount || 0, teachers: teachersCount || 0, absences: absencesCount || 0, revenue: totalRevenue });
      setPayments(paymentsData || []);
      setStudents(studentsData || []);
      const { data: notifData } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(5);
      setNotifications(notifData || []);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      const { data } = await supabase.from("Students").select("*").ilike("Nom", "%" + searchQuery + "%").limit(5);
      setSearchResults(data || []);
    };
    search();
  }, [searchQuery]);

  const updatePayment = async (paymentId: number) => {
    if (!editAmount) return;
    await supabase.from("payments").update({ montant: parseFloat(editAmount) }).eq("id", paymentId);
    setEditAmount(""); setExpandedRow(null);
    const { data } = await supabase.from("payments").select("*");
    setPayments(data || []);
  };

  const getStudentPayment = (studentId: number) => payments.find(p => p.student_id === studentId);
  const translateMonth = (mois: string) => monthNames[lang]?.[mois] || mois;

  const th = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    btnPressed: { background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: "14px" },
    row: { background: "rgba(30,41,59,0.8)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px" },
    dropdown: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
    title: "#ffffff", titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8", accent: "#22d3ee", accentGlow: "0 0 16px rgba(34,211,238,0.4)",
    chartText: "#cbd5e1", chartStroke: "#22d3ee",
    activeLang: "rgba(34,211,238,0.1)", activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    btnPressed: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "14px" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    title: "#1a202c", titleShadow: "none",
    subtext: "#718096", accent: "#4f6ef7", accentGlow: "none",
    chartText: "#718096", chartStroke: "#4f6ef7",
    activeLang: "rgba(79,110,247,0.08)", activeLangColor: "#4f6ef7",
  };

  const statsCards = [
    { label: t("totalStudents"), value: stats.students, icon: <GraduationCap size={22} color={darkMode ? "#22d3ee" : "#4f8ef7"} />, color: darkMode ? "#22d3ee" : "#4f8ef7", bg: darkMode ? "rgba(34,211,238,0.12)" : "#eff4ff", glow: "rgba(34,211,238,0.35)", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none" },
    { label: t("totalTeachers"), value: stats.teachers, icon: <Users size={22} color={darkMode ? "#a3e635" : "#3db87a"} />, color: darkMode ? "#a3e635" : "#3db87a", bg: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", glow: "rgba(163,230,53,0.35)", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none" },
    { label: t("todayAbsences"), value: stats.absences, icon: <UserX size={22} color={darkMode ? "#f87171" : "#e05c5c"} />, color: darkMode ? "#f87171" : "#e05c5c", bg: darkMode ? "rgba(248,113,113,0.12)" : "#fff3f3", glow: "rgba(248,113,113,0.35)", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none" },
    { label: t("monthRevenue"), value: stats.revenue + " " + currency, icon: <TrendingUp size={22} color={darkMode ? "#fbbf24" : "#e8a838"} />, color: darkMode ? "#fbbf24" : "#e8a838", bg: darkMode ? "rgba(251,191,36,0.12)" : "#fffbf0", glow: "rgba(251,191,36,0.35)", border: darkMode ? "1px solid rgba(251,191,36,0.2)" : "none" },
  ];

  const quickActions = [
    { label: t("students"), href: "/students", icon: <GraduationCap size={19} color={darkMode ? "#22d3ee" : "#4f8ef7"} />, bg: darkMode ? "rgba(34,211,238,0.1)" : "#eff4ff" },
    { label: t("absences"), href: "/absences", icon: <UserX size={19} color={darkMode ? "#f87171" : "#e05c5c"} />, bg: darkMode ? "rgba(248,113,113,0.1)" : "#fff3f3" },
    { label: t("grades"), href: "/grades", icon: <BookOpen size={19} color={darkMode ? "#a3e635" : "#3db87a"} />, bg: darkMode ? "rgba(163,230,53,0.1)" : "#f0faf5" },
    { label: t("classes"), href: "/classes", icon: <Settings size={19} color={darkMode ? "#fbbf24" : "#e8a838"} />, bg: darkMode ? "rgba(251,191,36,0.1)" : "#fffbf0" },
    { label: t("users"), href: "/users", icon: <Users size={19} color={darkMode ? "#c084fc" : "#9b7fe8"} />, bg: darkMode ? "rgba(192,132,252,0.1)" : "#f5f0ff" },
    { label: t("messages"), href: "/messages", icon: <MessageSquare size={19} color={darkMode ? "#60a5fa" : "#38b8c8"} />, bg: darkMode ? "rgba(96,165,250,0.1)" : "#f0fbff" },
  ];

  const getStatusConfig = (statut: string) => {
    if (statut === "خلص") return { color: "#4ade80", icon: <CheckCircle size={15} color="#4ade80" />, bg: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", label: t("paid") };
    if (statut === "جزئي") return { color: "#fbbf24", icon: <AlertCircle size={15} color="#fbbf24" />, bg: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", label: t("partial") };
    return { color: "#f87171", icon: <XCircle size={15} color="#f87171" />, bg: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", label: t("unpaid") };
  };

  const translatedChartData = revenueData.map(d => ({ ...d, mois: translateMonth(d.mois) }));

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">
      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...th.card, padding: "22px 28px", marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h1 style={{ fontSize: "21px", fontWeight: "800", color: th.title, textShadow: th.titleShadow }}>🏫 {t("appName")}</h1>
              <p style={{ color: th.subtext, fontSize: "13px", marginTop: "3px", fontWeight: "500" }}>{t("welcome")}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isMounted && (
                <div style={{ textAlign: "end" }}>
                  <p style={{ color: th.accent, fontSize: "18px", fontWeight: "800", textShadow: th.accentGlow }}>{currentTime}</p>
                  <p style={{ color: th.subtext, fontSize: "11px", fontWeight: "500" }}>{currentDate}</p>
                </div>
              )}
              <button onClick={() => setDarkMode(!darkMode)} style={{ ...th.btn, width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ transition: "transform 0.5s", transform: darkMode ? "rotate(360deg)" : "rotate(0deg)" }}>
                  {darkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#4f6ef7" />}
                </div>
              </button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowLang(!showLang)} style={{ ...th.btn, height: "40px", padding: "0 12px", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer" }}>
                  <Languages size={14} color={th.subtext} />
                  <span style={{ fontSize: "11px", fontWeight: "800", color: th.accent }}>{langs.find(l => l.code === lang)?.short}</span>
                </button>
                {showLang && (
                  <div style={{ ...th.dropdown, position: "absolute", insetInlineEnd: 0, top: "48px", minWidth: "130px", padding: "6px", zIndex: 100 }}>
                    {langs.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code as any); setShowLang(false); }}
                        style={{ width: "100%", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px", background: lang === l.code ? th.activeLang : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cairo', sans-serif" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: lang === l.code ? th.activeLangColor : th.subtext, background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "6px" }}>{l.short}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: lang === l.code ? th.activeLangColor : th.subtext }}>
                          {l.code === "ar" ? "العربية" : l.code === "fr" ? "Français" : "English"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{ ...th.inset, padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Search size={17} color={th.subtext} style={{ flexShrink: 0 }} />
              <input type="text" placeholder={t("search")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
            {searchResults.length > 0 && (
              <div style={{ ...th.card, position: "absolute", top: "56px", insetInlineStart: 0, insetInlineEnd: 0, zIndex: 50, padding: "8px" }}>
                {searchResults.map(s => (
                  <div key={s.id} style={{ padding: "10px 14px", borderRadius: "10px", cursor: "pointer" }}>
                    <p style={{ fontWeight: "700", color: th.title, fontSize: "14px" }}>{s.Nom} {s.Prenom}</p>
                    <p style={{ fontSize: "12px", color: th.subtext }}>{s.Classe}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {statsCards.map((card, i) => (
            <div key={i}
              style={{ ...th.card, padding: "20px", cursor: "pointer", transition: "all 0.25s", ...(pressedCard === i && darkMode ? { boxShadow: "0 0 28px " + card.glow } : {}), ...(pressedCard === i && !darkMode ? th.btnPressed : {}) }}
              onMouseDown={() => setPressedCard(i)} onMouseUp={() => setPressedCard(null)} onMouseLeave={() => setPressedCard(null)}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", textAlign: "center" }}>
                <div style={{ width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: card.bg, border: card.border, boxShadow: darkMode ? "0 0 16px " + card.glow : "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {card.icon}
                </div>
                <p style={{ fontSize: "26px", fontWeight: "800", color: card.color, textShadow: darkMode ? "0 0 20px " + card.glow : "none", lineHeight: 1 }}>{card.value}</p>
                <p style={{ color: th.subtext, fontSize: "11px", fontWeight: "600" }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div style={{ ...th.card, padding: "22px" }} className="lg:col-span-2">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
              <BarChart2 size={18} color={darkMode ? "#22d3ee" : "#4f6ef7"} />
              <h2 style={{ fontWeight: "700", color: th.title, fontSize: "15px", textShadow: th.titleShadow }}>{t("monthlyRevenue")}</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={translatedChartData}>
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: th.chartText, fontFamily: "'Cairo', sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: th.chartText }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [value + " " + currency, t("monthRevenue")]} contentStyle={{ borderRadius: "12px", border: darkMode ? "0.5px solid rgba(34,211,238,0.25)" : "none", background: darkMode ? "#1e293b" : "#ffffff", color: th.title, fontFamily: "'Cairo', sans-serif" }} />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={th.chartStroke} stopOpacity={darkMode ? 0.3 : 0.15} />
                    <stop offset="95%" stopColor={th.chartStroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="مداخيل" stroke={th.chartStroke} strokeWidth={2.5} fill="url(#grad)" dot={{ fill: th.chartStroke, r: 3.5, strokeWidth: 0 }} style={darkMode ? { filter: "drop-shadow(0 0 6px rgba(34,211,238,0.5))" } : {}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...th.card, padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Bell size={16} color={th.accent} style={darkMode ? { filter: "drop-shadow(0 0 6px rgba(34,211,238,0.6))" } : {}} />
              <h2 style={{ fontWeight: "700", color: th.title, fontSize: "15px", textShadow: th.titleShadow }}>{t("recentAlerts")}</h2>
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ width: "48px", height: "48px", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(34,211,238,0.08)" : "#f5f7fa" }}>
                  <Bell size={20} color={th.subtext} />
                </div>
                <p style={{ color: th.subtext, fontSize: "13px", fontWeight: "500" }}>{t("noNotifications")}</p>
              </div>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {notifications.map(n => (
                  <li key={n.id} style={{ ...th.inset, padding: "11px 13px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Bell size={14} color={th.accent} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "700", fontSize: "13px", color: th.title }}>{n.titre}</p>
                      <p style={{ fontSize: "11px", color: th.subtext }}>{n.contenu}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Monthly Tuition Tracker */}
        <div style={{ ...th.card, padding: "24px", marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            {/* العنوان دايما فالبداية — dir كيهضر عليه */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={18} color={darkMode ? "#fbbf24" : "#e8a838"} style={darkMode ? { filter: "drop-shadow(0 0 8px rgba(251,191,36,0.5))" } : {}} />
              <h2 style={{ fontWeight: "800", color: th.title, fontSize: "16px", textShadow: th.titleShadow }}>{t("monthlyTracker")}</h2>
            </div>
            {/* Badge فالنهاية */}
            <span style={{ fontSize: "12px", fontWeight: "600", color: th.subtext, background: darkMode ? "rgba(34,211,238,0.1)" : "#eff4ff", padding: "4px 10px", borderRadius: "20px", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none" }}>
              {students.length} {t("totalStudents")}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {students.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: th.subtext }}>
                <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noStudents")}</p>
              </div>
            ) : (
              students.map((student) => {
                const payment = getStudentPayment(student.id);
                const statut = payment?.statut || "مازال";
                const statusConfig = getStatusConfig(statut);
                const isExpanded = expandedRow === student.id;
                return (
                  <div key={student.id}>
                    <div
                      style={{ ...th.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => statut === "جزئي" ? setExpandedRow(isExpanded ? null : student.id) : null}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.01)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: th.title, textShadow: darkMode ? th.titleShadow : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {student.Nom} {student.Prenom}
                        </p>
                        <p style={{ fontSize: "11px", color: th.subtext, fontWeight: "500", marginTop: "2px" }}>
                          {payment?.mois ? translateMonth(payment.mois) : "—"}
                        </p>
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: th.subtext, background: darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9", padding: "3px 10px", borderRadius: "8px", marginInline: "12px", whiteSpace: "nowrap" }}>
                        {student.Classe}
                      </p>
                      <p style={{ fontSize: "14px", fontWeight: "800", color: payment?.montant ? (darkMode ? "#fbbf24" : "#e8a838") : th.subtext, marginInlineEnd: "12px", whiteSpace: "nowrap", textShadow: darkMode && payment?.montant ? "0 0 12px rgba(251,191,36,0.4)" : "none" }}>
                        {payment?.montant ? payment.montant + " " + currency : "—"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        <div style={{ background: statusConfig.bg, border: statusConfig.border, display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px" }}>
                          {statusConfig.icon}
                          <span style={{ fontSize: "11px", fontWeight: "700", color: statusConfig.color }}>{statusConfig.label}</span>
                        </div>
                        {statut === "جزئي" && (
                          <ChevronDown size={13} color={th.subtext} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                        )}
                      </div>
                    </div>

                    {isExpanded && statut === "جزئي" && (
                      <div style={{ ...th.inset, padding: "16px 18px", marginTop: "4px", display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
                        <div style={{ flexShrink: 0 }}>
                          <p style={{ fontSize: "12px", color: th.subtext, fontWeight: "500" }}>{t("paidAmount")}: <span style={{ color: "#4ade80", fontWeight: "700" }}>{payment?.montant || 0} {currency}</span></p>
                          <p style={{ fontSize: "12px", color: th.subtext, fontWeight: "500" }}>{t("remaining")}: <span style={{ color: "#f87171", fontWeight: "700" }}>—</span></p>
                        </div>
                        <input type="number" placeholder={t("amount") + "..."} value={editAmount} onChange={e => setEditAmount(e.target.value)}
                          style={{ ...th.inset, padding: "8px 14px", border: "none", outline: "none", fontSize: "13px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500", flex: 1 }} />
                        <button onClick={() => updatePayment(payment?.id)}
                          style={{ background: darkMode ? "rgba(34,211,238,0.15)" : "rgba(79,110,247,0.1)", border: darkMode ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(79,110,247,0.3)", borderRadius: "10px", padding: "8px 16px", color: th.accent, fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {t("update")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...th.card, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <TrendingUp size={16} color={th.accent} />
            <h2 style={{ fontWeight: "700", color: th.title, fontSize: "15px", textShadow: th.titleShadow }}>{t("quickActions")}</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action, i) => (
              <a key={i} href={action.href}
                style={{ ...(pressedAction === i ? th.btnPressed : th.btn), padding: "14px 8px", textAlign: "center", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", transition: "all 0.2s" }}
                onMouseDown={() => setPressedAction(i)} onMouseUp={() => setPressedAction(null)} onMouseLeave={() => setPressedAction(null)}>
                <div style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: action.bg }}>
                  {action.icon}
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: th.title }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}