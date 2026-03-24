"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Settings, Plus, ArrowLeft, ArrowRight, Sun, Moon, Trash2, Languages } from "lucide-react";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Classes() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [pressed, setPressed] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
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
    subtext: "#94a3b8", accent: "#fbbf24",
    activeLang: "rgba(34,211,238,0.1)", activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    title: "#1a202c", titleShadow: "none",
    subtext: "#718096", accent: "#e8a838",
    activeLang: "rgba(79,110,247,0.08)", activeLangColor: "#4f6ef7",
  };

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*");
    if (data) setClasses(data);
  };

  const fetchTeachers = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "teacher");
    if (data) setTeachers(data);
  };

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const addClass = async () => {
    if (!nom || !niveau) return;
    await supabase.from("classes").insert([{ nom, niveau, teacher_id: teacherId || null }]);
    setNom(""); setNiveau(""); setTeacherId("");
    fetchClasses();
  };

  const deleteClass = async (id: number) => {
    await supabase.from("classes").delete().eq("id", id);
    fetchClasses();
  };

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(251,191,36,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...th.card, padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/dashboard" style={{ ...th.btn, padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: th.accent, fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
              {dir === "rtl" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              {t("back")}
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(251,191,36,0.12)" : "#fffbf0", border: darkMode ? "1px solid rgba(251,191,36,0.2)" : "none", boxShadow: darkMode ? "0 0 12px rgba(251,191,36,0.3)" : "0 2px 6px rgba(0,0,0,0.06)" }}>
                <Settings size={18} color={th.accent} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: th.title, textShadow: th.titleShadow, whiteSpace: "nowrap" }}>{t("classes")}</h1>
            </div>
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

        {/* Add Form */}
        <div style={{ ...th.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "16px", fontSize: "15px", textShadow: th.titleShadow }}>{t("newClass")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <input placeholder={t("className")} value={nom} onChange={e => setNom(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <input placeholder={t("level")} value={niveau} onChange={e => setNiveau(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="">{t("selectTeacher")}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}
              </select>
            </div>
          </div>
          <button onClick={addClass} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
            style={{ background: darkMode ? "rgba(251,191,36,0.12)" : "rgba(232,168,56,0.1)", border: darkMode ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(232,168,56,0.35)", borderRadius: "14px", padding: "11px 22px", color: th.accent, fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s", transform: pressed ? "scale(0.98)" : "scale(1)" }}>
            <Plus size={17} /> {t("add")}
          </button>
        </div>

        {/* Classes List */}
        <div style={{ ...th.card, padding: "24px" }}>
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "16px", fontSize: "15px", textShadow: th.titleShadow }}>
            {t("classesList")} ({classes.length})
          </h2>
          {classes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: th.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(251,191,36,0.08)" : "#fffbf0" }}>
                <Settings size={26} color={th.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noClasses")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {classes.map((c) => (
                <div key={c.id}
                  style={{ ...th.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s", transform: hoveredRow === c.id ? "scale(1.01)" : "scale(1)", boxShadow: hoveredRow === c.id ? (darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)") : "none" }}
                  onMouseEnter={() => setHoveredRow(c.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <button onClick={() => deleteClass(c.id)} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    <Trash2 size={14} color="#f87171" />
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <p style={{ fontSize: "13px", color: th.subtext, fontWeight: "500" }}>
                      {teachers.find(t => t.id === c.teacher_id)?.nom || "—"}
                    </p>
                    <p style={{ fontSize: "13px", color: th.title, fontWeight: "500" }}>{c.niveau}</p>
                    <p style={{ fontSize: "14px", color: th.accent, fontWeight: "800", textShadow: darkMode ? "0 0 16px rgba(251,191,36,0.4)" : "none" }}>{c.nom}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}