"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, Plus, ArrowLeft, ArrowRight, Sun, Moon, Languages } from "lucide-react";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UsersPage() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pressed, setPressed] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
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

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) setProfiles(data);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  useEffect(() => { fetchProfiles(); fetchStudents(); }, []);

  const addUser = async () => {
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setMessage("خطأ: " + error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert([{
        id: data.user.id, role, nom, prenom,
        student_id: role === "parent" ? parseInt(studentId) : null
      }]);
    }
    setMessage(t("successAdd"));
    setEmail(""); setPassword(""); setNom(""); setPrenom(""); setStudentId("");
    fetchProfiles();
    setLoading(false);
  };

  const getRoleConfig = (role: string) => {
    if (role === "admin") return { color: darkMode ? "#22d3ee" : "#4f8ef7", bg: darkMode ? "rgba(34,211,238,0.1)" : "#eff4ff", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none", label: t("admin") };
    if (role === "teacher") return { color: darkMode ? "#a3e635" : "#3db87a", bg: darkMode ? "rgba(163,230,53,0.1)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", label: t("teacher") };
    return { color: darkMode ? "#c084fc" : "#9b7fe8", bg: darkMode ? "rgba(192,132,252,0.1)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.2)" : "none", label: t("parent") };
  };

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...th.card, padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/dashboard" style={{ ...th.btn, padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: th.accent, fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
              {dir === "rtl" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              {t("back")}
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.12)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.2)" : "none", boxShadow: darkMode ? "0 0 12px rgba(192,132,252,0.3)" : "0 2px 6px rgba(0,0,0,0.06)" }}>
                <Users size={18} color={th.accent} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: th.title, textShadow: th.titleShadow, whiteSpace: "nowrap" }}>{t("users")}</h1>
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
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "16px", fontSize: "15px", textShadow: th.titleShadow }}>{t("newUser")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { placeholder: t("name"), value: nom, set: setNom, type: "text" },
              { placeholder: t("lastname"), value: prenom, set: setPrenom, type: "text" },
              { placeholder: t("email"), value: email, set: setEmail, type: "email" },
              { placeholder: t("password"), value: password, set: setPassword, type: "password" },
            ].map((field, i) => (
              <div key={i} style={{ ...th.inset, padding: "12px 16px" }}>
                <input type={field.type} placeholder={field.placeholder} value={field.value} onChange={e => field.set(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
              </div>
            ))}
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="teacher">{t("teacher")}</option>
                <option value="parent">{t("parent")}</option>
                <option value="admin">{t("admin")}</option>
              </select>
            </div>
            {role === "parent" && (
              <div style={{ ...th.inset, padding: "12px 16px" }}>
                <select value={studentId} onChange={e => setStudentId(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                  <option value="">{t("selectStudent")}</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>)}
                </select>
              </div>
            )}
          </div>

          {message && (
            <div style={{ background: message.includes("✅") ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", border: "1px solid " + (message.includes("✅") ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"), borderRadius: "12px", padding: "10px 14px", marginBottom: "12px" }}>
              <p style={{ color: message.includes("✅") ? "#4ade80" : "#f87171", fontSize: "13px", fontWeight: "600" }}>{message}</p>
            </div>
          )}

          <button onClick={addUser} disabled={loading} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
            style={{ background: darkMode ? "rgba(192,132,252,0.12)" : "rgba(155,127,232,0.1)", border: darkMode ? "1px solid rgba(192,132,252,0.35)" : "1px solid rgba(155,127,232,0.35)", borderRadius: "14px", padding: "11px 22px", color: th.accent, fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s", transform: pressed ? "scale(0.98)" : "scale(1)", opacity: loading ? 0.7 : 1 }}>
            <Plus size={17} />
            {loading ? "..." : t("add")}
          </button>
        </div>

        {/* Users List */}
        <div style={{ ...th.card, padding: "24px" }}>
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "16px", fontSize: "15px", textShadow: th.titleShadow }}>
            {t("usersList")} ({profiles.length})
          </h2>
          {profiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: th.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.08)" : "#f5f0ff" }}>
                <Users size={26} color={th.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noUsers")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {profiles.map((p) => {
                const roleConfig = getRoleConfig(p.role);
                return (
                  <div key={p.id}
                    style={{ ...th.row, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s", transform: hoveredRow === p.id ? "scale(1.01)" : "scale(1)", boxShadow: hoveredRow === p.id ? (darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)") : "none" }}
                    onMouseEnter={() => setHoveredRow(p.id)} onMouseLeave={() => setHoveredRow(null)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: roleConfig.color, background: roleConfig.bg, border: roleConfig.border, padding: "4px 12px", borderRadius: "20px", textShadow: darkMode ? "0 0 10px " + roleConfig.color + "66" : "none" }}>
                        {roleConfig.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <p style={{ fontSize: "13px", color: th.subtext, fontWeight: "500" }}>{p.prenom}</p>
                      <p style={{ fontSize: "14px", color: th.title, fontWeight: "700", textShadow: darkMode ? th.titleShadow : "none" }}>{p.nom}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}