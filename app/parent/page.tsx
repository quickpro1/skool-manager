"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GraduationCap, ClipboardList, BookOpen, Sun, Moon, LogOut, Languages, User } from "lucide-react";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Parent() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [absences, setAbsences] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<"absences" | "grades">("grades");
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
    row: { background: "rgba(30,41,59,0.8)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px" },
    dropdown: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
    title: "#ffffff", titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8", accent: "#c084fc",
    activeLang: "rgba(34,211,238,0.1)", activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    title: "#1a202c", titleShadow: "none",
    subtext: "#718096", accent: "#9b7fe8",
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
        if (profileData?.student_id) {
          const { data: studentData } = await supabase.from("Students").select("*").eq("id", profileData.student_id).single();
          setStudent(studentData);
          const { data: absData } = await supabase.from("absences").select("*").eq("student_id", profileData.student_id).order("date", { ascending: false });
          setAbsences(absData || []);
          const { data: gradesData } = await supabase.from("grades").select("*").eq("student_id", profileData.student_id);
          setGrades(gradesData || []);
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getNoteColor = (note: number) => {
    if (note >= 16) return darkMode ? "#4ade80" : "#22c55e";
    if (note >= 12) return darkMode ? "#fbbf24" : "#f59e0b";
    return darkMode ? "#f87171" : "#ef4444";
  };

  const getNoteGlow = (note: number) => {
    if (note >= 16) return "rgba(74,222,128,0.4)";
    if (note >= 12) return "rgba(251,191,36,0.4)";
    return "rgba(248,113,113,0.4)";
  };

  const avgGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.note || 0), 0) / grades.length).toFixed(1)
    : "—";

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

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
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.12)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.2)" : "none", boxShadow: darkMode ? "0 0 12px rgba(192,132,252,0.3)" : "0 2px 6px rgba(0,0,0,0.06)" }}>
                <User size={18} color={th.accent} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: th.title, textShadow: th.titleShadow, whiteSpace: "nowrap" }}>{t("parentBoard")}</h1>
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

        {/* Student Info Card */}
        {student ? (
          <div style={{ ...th.card, padding: "24px", marginBottom: "24px" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.12)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.25)" : "1px solid rgba(155,127,232,0.2)", boxShadow: darkMode ? "0 0 20px rgba(192,132,252,0.2)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <GraduationCap size={24} color={th.accent} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: th.subtext, fontWeight: "600" }}>{t("student")}</p>
                  <p style={{ fontSize: "16px", fontWeight: "800", color: th.title, textShadow: darkMode ? th.titleShadow : "none" }}>{student.Nom} {student.Prenom}</p>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: th.subtext, fontWeight: "600", marginBottom: "4px" }}>{t("class")}</p>
                <p style={{ fontSize: "18px", fontWeight: "800", color: th.accent, textShadow: darkMode ? "0 0 16px rgba(192,132,252,0.4)" : "none" }}>{student.Classe}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div style={{ ...th.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#f87171" : "#e05c5c", textShadow: darkMode ? "0 0 16px rgba(248,113,113,0.4)" : "none" }}>{absences.length}</p>
                  <p style={{ fontSize: "10px", color: th.subtext, fontWeight: "600", marginTop: "2px" }}>{t("absence")}</p>
                </div>
                <div style={{ ...th.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#a3e635" : "#3db87a", textShadow: darkMode ? "0 0 16px rgba(163,230,53,0.4)" : "none" }}>{grades.length}</p>
                  <p style={{ fontSize: "10px", color: th.subtext, fontWeight: "600", marginTop: "2px" }}>{t("grade")}</p>
                </div>
                <div style={{ ...th.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#fbbf24" : "#e8a838", textShadow: darkMode ? "0 0 16px rgba(251,191,36,0.4)" : "none" }}>{avgGrade}</p>
                  <p style={{ fontSize: "10px", color: th.subtext, fontWeight: "600", marginTop: "2px" }}>{t("average")}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...th.card, padding: "24px", marginBottom: "24px", textAlign: "center" }}>
            <p style={{ color: th.subtext, fontSize: "14px", fontWeight: "500" }}>لم يتم ربط أي تلميذ بحسابك</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...th.card, padding: "24px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[
              { key: "grades", label: t("grades"), icon: <BookOpen size={15} />, color: darkMode ? "#a3e635" : "#3db87a", glow: "rgba(163,230,53,0.3)" },
              { key: "absences", label: t("absences"), icon: <ClipboardList size={15} />, color: darkMode ? "#f87171" : "#e05c5c", glow: "rgba(248,113,113,0.3)" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as "absences" | "grades")}
                style={{ padding: "9px 18px", borderRadius: "12px", border: activeTab === tab.key ? "1px solid " + tab.color + "55" : (darkMode ? "0.5px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"), background: activeTab === tab.key ? (darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)") : "transparent", color: activeTab === tab.key ? tab.color : th.subtext, fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s", boxShadow: activeTab === tab.key && darkMode ? "0 0 16px " + tab.glow : "none" }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Grades Tab */}
          {activeTab === "grades" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {grades.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: th.subtext }}>
                  <BookOpen size={32} color={th.subtext} style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noGrades")}</p>
                </div>
              ) : (
                grades.map(g => (
                  <div key={g.id} style={{ ...th.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: getNoteColor(g.note), textShadow: darkMode ? "0 0 16px " + getNoteGlow(g.note) : "none", background: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)", padding: "4px 14px", borderRadius: "20px", border: darkMode ? "1px solid " + getNoteColor(g.note) + "33" : "none" }}>
                      {g.note}/20
                    </span>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: th.title, textShadow: darkMode ? th.titleShadow : "none" }}>{g.matiere}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Absences Tab */}
          {activeTab === "absences" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {absences.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: th.subtext }}>
                  <ClipboardList size={32} color={th.subtext} style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noAbsences")} 🎉</p>
                </div>
              ) : (
                absences.map(a => (
                  <div key={a.id} style={{ ...th.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: darkMode ? "#f87171" : "#e05c5c", boxShadow: darkMode ? "0 0 8px rgba(248,113,113,0.6)" : "none" }} />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: darkMode ? "#f87171" : "#e05c5c", background: "rgba(248,113,113,0.1)", padding: "3px 10px", borderRadius: "20px", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none" }}>
                        {t("absence")}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: th.title, textShadow: darkMode ? th.titleShadow : "none" }}>{a.date}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}