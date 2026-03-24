"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GraduationCap, ClipboardList, BookOpen, MessageSquare, Sun, Moon, LogOut } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Teacher() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ absences: 0, grades: 0, messages: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [pressedAction, setPressedAction] = useState<number | null>(null);

  const t = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    btnPressed: { background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "14px" },
    row: { background: "rgba(30,41,59,0.8)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px" },
    title: "#ffffff",
    titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8",
    accent: "#a3e635",
    accentGlow: "rgba(163,230,53,0.3)",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    btnPressed: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "14px" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    title: "#1a202c",
    titleShadow: "none",
    subtext: "#718096",
    accent: "#3db87a",
    accentGlow: "rgba(61,184,122,0.2)",
  };

  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString("ar-MA"));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
        setProfile(profileData);

        const { count: absencesCount } = await supabase.from("absences").select("*", { count: "exact", head: true });
        const { count: gradesCount } = await supabase.from("grades").select("*", { count: "exact", head: true });
        const { count: messagesCount } = await supabase.from("messages").select("*", { count: "exact", head: true })
          .or("sender_id.eq." + userData.user.id + ",receiver_id.eq." + userData.user.id);

        setStats({ absences: absencesCount || 0, grades: gradesCount || 0, messages: messagesCount || 0 });
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const actions = [
    { label: "تسجيل الغياب", href: "/absences", icon: <ClipboardList size={24} color={darkMode ? "#f87171" : "#e05c5c"} />, color: darkMode ? "#f87171" : "#e05c5c", bg: darkMode ? "rgba(248,113,113,0.12)" : "#fff3f3", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none", glow: "rgba(248,113,113,0.3)", stat: stats.absences, statLabel: "غياب مسجل" },
    { label: "إدخال النقط", href: "/grades", icon: <BookOpen size={24} color={darkMode ? "#a3e635" : "#3db87a"} />, color: darkMode ? "#a3e635" : "#3db87a", bg: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", glow: "rgba(163,230,53,0.3)", stat: stats.grades, statLabel: "نقطة مسجلة" },
    { label: "الرسائل", href: "/messages", icon: <MessageSquare size={24} color={darkMode ? "#60a5fa" : "#38b8c8"} />, color: darkMode ? "#60a5fa" : "#38b8c8", bg: darkMode ? "rgba(96,165,250,0.12)" : "#f0fbff", border: darkMode ? "1px solid rgba(96,165,250,0.2)" : "none", glow: "rgba(96,165,250,0.3)", stat: stats.messages, statLabel: "رسالة" },
    { label: "التلاميذ", href: "/students", icon: <GraduationCap size={24} color={darkMode ? "#22d3ee" : "#4f8ef7"} />, color: darkMode ? "#22d3ee" : "#4f8ef7", bg: darkMode ? "rgba(34,211,238,0.12)" : "#eff4ff", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none", glow: "rgba(34,211,238,0.3)", stat: null, statLabel: "" },
  ];

  return (
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(163,230,53,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...t.card, padding: "22px 28px", marginBottom: "24px" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleLogout}
                style={{ ...t.btn, padding: "9px 16px", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer", color: darkMode ? "#f87171" : "#e05c5c", fontWeight: "700", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}
              >
                <LogOut size={15} /> خروج
              </button>
              <button onClick={() => setDarkMode(!darkMode)} style={{ ...t.btn, width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ transition: "transform 0.5s", transform: darkMode ? "rotate(360deg)" : "rotate(0deg)" }}>
                  {darkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#4f6ef7" />}
                </div>
              </button>
            </div>
            <div className="text-right">
              <h1 style={{ fontSize: "21px", fontWeight: "800", color: t.title, textShadow: t.titleShadow }}>
                👨‍🏫 لوحة الأستاذ
              </h1>
              <p style={{ color: t.subtext, fontSize: "13px", marginTop: "4px", fontWeight: "500" }}>
                مرحباً، {profile?.nom || user?.email}
              </p>
            </div>
          </div>

          {isMounted && (
            <div style={{ ...t.inset, padding: "12px 18px", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ color: t.accent, fontSize: "18px", fontWeight: "800", textShadow: darkMode ? t.accentGlow : "none" }}>{currentTime}</p>
              <p style={{ color: t.subtext, fontSize: "12px", fontWeight: "500" }}>
                {new Date().toLocaleDateString("ar-MA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          )}
        </div>

        {/* Welcome Card */}
        <div style={{ ...t.card, padding: "24px", marginBottom: "24px", background: darkMode ? "linear-gradient(135deg, #1e293b 0%, rgba(163,230,53,0.05) 100%)" : "linear-gradient(135deg, #ffffff 0%, #f0faf5 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.25)" : "1px solid rgba(61,184,122,0.2)", boxShadow: darkMode ? "0 0 20px rgba(163,230,53,0.2)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
                <GraduationCap size={26} color={t.accent} />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: t.subtext, fontWeight: "600" }}>الدور</p>
                <p style={{ fontSize: "16px", fontWeight: "800", color: t.accent, textShadow: darkMode ? "0 0 16px " + t.accentGlow : "none" }}>أستاذ</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: t.subtext, fontWeight: "600", marginBottom: "4px" }}>الإيميل</p>
              <p style={{ fontSize: "13px", fontWeight: "600", color: t.title }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {actions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              style={{
                ...(pressedAction === i ? t.btnPressed : t.card),
                padding: "24px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.25s",
                cursor: "pointer",
              }}
              onMouseDown={() => setPressedAction(i)}
              onMouseUp={() => setPressedAction(null)}
              onMouseLeave={() => setPressedAction(null)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)";
                if (darkMode) (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 20px " + action.glow;
              }}
            >
              <div style={{ textAlign: "left" }}>
                {action.stat !== null && (
                  <div>
                    <p style={{ fontSize: "28px", fontWeight: "800", color: action.color, textShadow: darkMode ? "0 0 20px " + action.glow : "none" }}>{action.stat}</p>
                    <p style={{ fontSize: "11px", color: t.subtext, fontWeight: "500" }}>{action.statLabel}</p>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: action.bg, border: action.border, boxShadow: darkMode ? "0 0 18px " + action.glow : "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {action.icon}
                </div>
                <p style={{ fontSize: "15px", fontWeight: "800", color: t.title, textShadow: darkMode ? t.titleShadow : "none" }}>{action.label}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}