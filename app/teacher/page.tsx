"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GraduationCap, ClipboardList, BookOpen, MessageSquare, Sun, Moon, LogOut, Languages } from "lucide-react";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Teacher() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ absences: 0, grades: 0, messages: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [pressedAction, setPressedAction] = useState<number | null>(null);
  const [showLang, setShowLang] = useState(false);

  const dir = lang === "ar" ? "rtl" : "ltr";

  const langs = [
    { code: "ar", short: "AR" },
    { code: "fr", short: "FR" },
    { code: "en", short: "EN" },
  ];

  const th = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    btnPressed: { background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "14px" },
    dropdown: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
    title: "#ffffff", titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8", accent: "#a3e635",
    activeLang: "rgba(34,211,238,0.1)", activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    btnPressed: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "14px" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    title: "#1a202c", titleShadow: "none",
    subtext: "#718096", accent: "#3db87a",
    activeLang: "rgba(79,110,247,0.08)", activeLangColor: "#4f6ef7",
  };

  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => {
      const localeMap: Record<string, string> = { ar: "ar-MA", fr: "fr-FR", en: "en-US" };
      setCurrentTime(new Date().toLocaleTimeString(localeMap[lang]));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

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
    { label: t("absences"), href: "/absences", icon: <ClipboardList size={24} color={darkMode ? "#f87171" : "#e05c5c"} />, color: darkMode ? "#f87171" : "#e05c5c", bg: darkMode ? "rgba(248,113,113,0.12)" : "#fff3f3", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none", glow: "rgba(248,113,113,0.3)", stat: stats.absences },
    { label: t("grades"), href: "/grades", icon: <BookOpen size={24} color={darkMode ? "#a3e635" : "#3db87a"} />, color: darkMode ? "#a3e635" : "#3db87a", bg: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", glow: "rgba(163,230,53,0.3)", stat: stats.grades },
    { label: t("messages"), href: "/messages", icon: <MessageSquare size={24} color={darkMode ? "#60a5fa" : "#38b8c8"} />, color: darkMode ? "#60a5fa" : "#38b8c8", bg: darkMode ? "rgba(96,165,250,0.12)" : "#f0fbff", border: darkMode ? "1px solid rgba(96,165,250,0.2)" : "none", glow: "rgba(96,165,250,0.3)", stat: stats.messages },
    { label: t("students"), href: "/students", icon: <GraduationCap size={24} color={darkMode ? "#22d3ee" : "#4f8ef7"} />, color: darkMode ? "#22d3ee" : "#4f8ef7", bg: darkMode ? "rgba(34,211,238,0.12)" : "#eff4ff", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none", glow: "rgba(34,211,238,0.3)", stat: null },
  ];

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(163,230,53,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...th.card, padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* Start: Logout */}
            <button onClick={handleLogout} style={{ ...th.btn, padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer", color: darkMode ? "#f87171" : "#e05c5c", fontWeight: "700", fontSize: "13px", fontFamily: "'Cairo', sans-serif", flexShrink: 0 }}>
              <LogOut size={15} /> {t("logout")}
            </button>

            {/* Center: Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", boxShadow: darkMode ? "0 0 12px rgba(163,230,53,0.3)" : "0 2px 6px rgba(0,0,0,0.06)" }}>
                <GraduationCap size={18} color={th.accent} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: th.title, textShadow: th.titleShadow, whiteSpace: "nowrap" }}>{t("teacherBoard")}</h1>
            </div>

            {/* End: Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ ...th.btn, width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ transition: "transform 0.5s", transform: darkMode ? "rotate(360deg)" : "rotate(0deg)" }}>
                  {darkMode ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#4f6ef7" />}
                </div>
              </button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowLang(!showLang)} style={{ ...th.btn, height: "38px", padding: "0 10px", display: "flex", alignItems: "center", gap: "5px", border: "none", cursor: "pointer" }}>
                  <Languages size={13} color={th.subtext} />
                  <span style={{ fontSize: "11px", fontWeight: "800", color: darkMode ? "#22d3ee" : "#4f6ef7" }}>{langs.find(l => l.code === lang)?.short}</span>
                </button>
                {showLang && (
                  <div style={{ ...th.dropdown, position: "absolute", insetInlineEnd: 0, top: "46px", minWidth: "130px", padding: "6px", zIndex: 100 }}>
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
        </div>

        {/* Welcome Card */}
        <div style={{ ...th.card, padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.25)" : "1px solid rgba(61,184,122,0.2)", boxShadow: darkMode ? "0 0 20px rgba(163,230,53,0.2)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
                <GraduationCap size={26} color={th.accent} />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: th.subtext, fontWeight: "600" }}>{t("role")}</p>
                <p style={{ fontSize: "16px", fontWeight: "800", color: th.accent, textShadow: darkMode ? "0 0 16px rgba(163,230,53,0.3)" : "none" }}>{t("teacher")}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: th.subtext, fontWeight: "600", marginBottom: "4px" }}>{profile?.nom || ""}</p>
              {isMounted && <p style={{ fontSize: "20px", fontWeight: "800", color: th.accent }}>{currentTime}</p>}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {actions.map((action, i) => (
            <a key={i} href={action.href}
              style={{ ...(pressedAction === i ? th.btnPressed : th.card), padding: "24px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.25s", cursor: "pointer" }}
              onMouseDown={() => setPressedAction(i)} onMouseUp={() => setPressedAction(null)} onMouseLeave={() => setPressedAction(null)}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: action.bg, border: action.border, boxShadow: darkMode ? "0 0 18px " + action.glow : "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {action.icon}
                </div>
                <p style={{ fontSize: "15px", fontWeight: "800", color: th.title, textShadow: darkMode ? th.titleShadow : "none" }}>{action.label}</p>
              </div>
              {action.stat !== null && (
                <div style={{ textAlign: "end" }}>
                  <p style={{ fontSize: "28px", fontWeight: "800", color: action.color, textShadow: darkMode ? "0 0 20px " + action.glow : "none" }}>{action.stat}</p>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}