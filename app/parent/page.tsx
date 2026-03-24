"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GraduationCap, ClipboardList, BookOpen, Sun, Moon, LogOut, User } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Parent() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [absences, setAbsences] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<"absences" | "grades">("grades");

  const t = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    row: { background: "rgba(30,41,59,0.8)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px" },
    title: "#ffffff",
    titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8",
    accent: "#c084fc",
    accentGlow: "rgba(192,132,252,0.3)",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    title: "#1a202c",
    titleShadow: "none",
    subtext: "#718096",
    accent: "#9b7fe8",
    accentGlow: "rgba(155,127,232,0.2)",
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
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...t.card, padding: "22px 28px", marginBottom: "24px" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={handleLogout} style={{ ...t.btn, padding: "9px 16px", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer", color: darkMode ? "#f87171" : "#e05c5c", fontWeight: "700", fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>
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
                👨‍👩‍👧 لوحة الولي
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

        {/* Student Info Card */}
        {student ? (
          <div style={{ ...t.card, padding: "24px", marginBottom: "24px", background: darkMode ? "linear-gradient(135deg, #1e293b 0%, rgba(192,132,252,0.05) 100%)" : "linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.12)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.25)" : "1px solid rgba(155,127,232,0.2)", boxShadow: darkMode ? "0 0 20px rgba(192,132,252,0.2)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <User size={24} color={t.accent} />
                </div>
                <div className="text-right">
                  <p style={{ fontSize: "11px", color: t.subtext, fontWeight: "600" }}>التلميذ</p>
                  <p style={{ fontSize: "16px", fontWeight: "800", color: t.title, textShadow: darkMode ? t.titleShadow : "none" }}>{student.Nom} {student.Prenom}</p>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: t.subtext, fontWeight: "600", marginBottom: "4px" }}>الفصل</p>
                <p style={{ fontSize: "18px", fontWeight: "800", color: t.accent, textShadow: darkMode ? "0 0 16px " + t.accentGlow : "none" }}>{student.Classe}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div style={{ ...t.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#f87171" : "#e05c5c", textShadow: darkMode ? "0 0 16px rgba(248,113,113,0.4)" : "none" }}>{absences.length}</p>
                  <p style={{ fontSize: "10px", color: t.subtext, fontWeight: "600", marginTop: "2px" }}>غياب</p>
                </div>
                <div style={{ ...t.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#a3e635" : "#3db87a", textShadow: darkMode ? "0 0 16px rgba(163,230,53,0.4)" : "none" }}>{grades.length}</p>
                  <p style={{ fontSize: "10px", color: t.subtext, fontWeight: "600", marginTop: "2px" }}>نقطة</p>
                </div>
                <div style={{ ...t.inset, padding: "12px", textAlign: "center" }}>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: darkMode ? "#fbbf24" : "#e8a838", textShadow: darkMode ? "0 0 16px rgba(251,191,36,0.4)" : "none" }}>{avgGrade}</p>
                  <p style={{ fontSize: "10px", color: t.subtext, fontWeight: "600", marginTop: "2px" }}>معدل</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...t.card, padding: "24px", marginBottom: "24px", textAlign: "center" }}>
            <p style={{ color: t.subtext, fontSize: "14px", fontWeight: "500" }}>لم يتم ربط أي تلميذ بحسابك بعد</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...t.card, padding: "24px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "flex-end" }}>
            {[
              { key: "grades", label: "النقط", icon: <BookOpen size={15} />, color: darkMode ? "#a3e635" : "#3db87a", glow: "rgba(163,230,53,0.3)" },
              { key: "absences", label: "الغياب", icon: <ClipboardList size={15} />, color: darkMode ? "#f87171" : "#e05c5c", glow: "rgba(248,113,113,0.3)" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "absences" | "grades")}
                style={{
                  padding: "9px 18px",
                  borderRadius: "12px",
                  border: activeTab === tab.key ? "1px solid " + tab.color + "55" : (darkMode ? "0.5px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"),
                  background: activeTab === tab.key ? (darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)") : "transparent",
                  color: activeTab === tab.key ? tab.color : t.subtext,
                  fontWeight: "700", fontSize: "13px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                  fontFamily: "'Cairo', sans-serif", transition: "all 0.2s",
                  boxShadow: activeTab === tab.key && darkMode ? "0 0 16px " + tab.glow : "none",
                  textShadow: activeTab === tab.key && darkMode ? "0 0 10px " + tab.color : "none",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Grades Tab */}
          {activeTab === "grades" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {grades.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: t.subtext }}>
                  <BookOpen size={32} color={t.subtext} style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", fontWeight: "500" }}>لا توجد نقط مسجلة</p>
                </div>
              ) : (
                grades.map(g => (
                  <div key={g.id} style={{ ...t.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: getNoteColor(g.note), textShadow: darkMode ? "0 0 16px " + getNoteGlow(g.note) : "none", background: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)", padding: "4px 14px", borderRadius: "20px", border: darkMode ? "1px solid " + getNoteColor(g.note) + "33" : "none" }}>
                        {g.note}/20
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: t.title, textShadow: darkMode ? t.titleShadow : "none" }}>{g.matiere}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Absences Tab */}
          {activeTab === "absences" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {absences.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: t.subtext }}>
                  <ClipboardList size={32} color={t.subtext} style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", fontWeight: "500" }}>لا يوجد غياب مسجل 🎉</p>
                </div>
              ) : (
                absences.map(a => (
                  <div key={a.id} style={{ ...t.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: darkMode ? "#f87171" : "#e05c5c", boxShadow: darkMode ? "0 0 8px rgba(248,113,113,0.6)" : "none" }} />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: darkMode ? "#f87171" : "#e05c5c", background: "rgba(248,113,113,0.1)", padding: "3px 10px", borderRadius: "20px", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none" }}>
                        غياب
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: t.title, textShadow: darkMode ? t.titleShadow : "none" }}>{a.date}</p>
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