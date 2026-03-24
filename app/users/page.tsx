"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, Plus, ArrowRight, Sun, Moon } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UsersPage() {
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
  const [darkMode, setDarkMode] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
    setMessage("✅ تمت إضافة المستخدم بنجاح!");
    setEmail(""); setPassword(""); setNom(""); setPrenom(""); setStudentId("");
    fetchProfiles();
    setLoading(false);
  };

  const getRoleConfig = (role: string) => {
    if (role === "admin") return { color: darkMode ? "#22d3ee" : "#4f8ef7", bg: darkMode ? "rgba(34,211,238,0.1)" : "#eff4ff", border: darkMode ? "1px solid rgba(34,211,238,0.2)" : "none", label: "مدير" };
    if (role === "teacher") return { color: darkMode ? "#a3e635" : "#3db87a", bg: darkMode ? "rgba(163,230,53,0.1)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", label: "أستاذ" };
    return { color: darkMode ? "#c084fc" : "#9b7fe8", bg: darkMode ? "rgba(192,132,252,0.1)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.2)" : "none", label: "ولي" };
  };

  return (
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ ...t.card, padding: "20px 28px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ ...t.btn, width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
              <div style={{ transition: "transform 0.5s", transform: darkMode ? "rotate(360deg)" : "rotate(0deg)" }}>
                {darkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#4f6ef7" />}
              </div>
            </button>
            <a href="/dashboard" style={{ ...t.btn, padding: "9px 16px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: t.accent, fontWeight: "700", fontSize: "13px" }}>
              <ArrowRight size={15} /> رجوع
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: t.title, textShadow: t.titleShadow }}>المستخدمين</h1>
            <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.12)" : "#f5f0ff", border: darkMode ? "1px solid rgba(192,132,252,0.2)" : "none", boxShadow: darkMode ? "0 0 14px rgba(192,132,252,0.3)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
              <Users size={20} color={t.accent} />
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div style={{ ...t.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>إضافة مستخدم جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { placeholder: "الاسم", value: nom, set: setNom, type: "text" },
              { placeholder: "النسب", value: prenom, set: setPrenom, type: "text" },
              { placeholder: "الإيميل", value: email, set: setEmail, type: "email" },
              { placeholder: "كلمة السر", value: password, set: setPassword, type: "password" },
            ].map((field, i) => (
              <div key={i} style={{ ...t.inset, padding: "12px 16px" }}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}
                />
              </div>
            ))}
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="teacher">أستاذ</option>
                <option value="parent">ولي</option>
                <option value="admin">مدير</option>
              </select>
            </div>
            {role === "parent" && (
              <div style={{ ...t.inset, padding: "12px 16px" }}>
                <select value={studentId} onChange={e => setStudentId(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                  <option value="">اختار التلميذ</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>)}
                </select>
              </div>
            )}
          </div>

          {message && (
            <div style={{ background: message.includes("✅") ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", border: "1px solid " + (message.includes("✅") ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"), borderRadius: "12px", padding: "10px 14px", textAlign: "right", marginBottom: "12px" }}>
              <p style={{ color: message.includes("✅") ? "#4ade80" : "#f87171", fontSize: "13px", fontWeight: "600" }}>{message}</p>
            </div>
          )}

          <button
            onClick={addUser}
            disabled={loading}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            style={{
              background: darkMode ? "rgba(192,132,252,0.12)" : "rgba(155,127,232,0.1)",
              border: darkMode ? "1px solid rgba(192,132,252,0.35)" : "1px solid rgba(155,127,232,0.35)",
              borderRadius: "14px", padding: "11px 22px", color: t.accent, fontWeight: "700", fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px",
              fontFamily: "'Cairo', sans-serif", transition: "all 0.2s",
              transform: pressed ? "scale(0.98)" : "scale(1)",
              opacity: loading ? 0.7 : 1,
              boxShadow: darkMode ? "0 0 20px " + t.accentGlow : "none",
            }}
          >
            <Plus size={17} />
            {loading ? "جاري الإضافة..." : "إضافة"}
          </button>
        </div>

        {/* Users List */}
        <div style={{ ...t.card, padding: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>
            قائمة المستخدمين ({profiles.length})
          </h2>

          {profiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: t.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(192,132,252,0.08)" : "#f5f0ff" }}>
                <Users size={26} color={t.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>لا يوجد مستخدمين بعد</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px", padding: "8px 18px", marginBottom: "4px" }}>
                {["النسب", "الاسم", "الدور"].map((h, i) => (
                  <p key={i} style={{ textAlign: "right", fontSize: "11px", fontWeight: "700", color: t.subtext }}>{h}</p>
                ))}
              </div>
              {profiles.map((p) => {
                const roleConfig = getRoleConfig(p.role);
                return (
                  <div
                    key={p.id}
                    style={{
                      ...t.row, padding: "14px 18px",
                      display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "12px", alignItems: "center",
                      transition: "all 0.2s",
                      transform: hoveredRow === p.id ? "scale(1.01)" : "scale(1)",
                      boxShadow: hoveredRow === p.id ? (darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)") : "none",
                    }}
                    onMouseEnter={() => setHoveredRow(p.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <p style={{ textAlign: "right", fontSize: "13px", color: t.title, fontWeight: "500" }}>{p.prenom}</p>
                    <p style={{ textAlign: "right", fontSize: "14px", color: t.title, fontWeight: "700", textShadow: darkMode ? t.titleShadow : "none" }}>{p.nom}</p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: roleConfig.color, background: roleConfig.bg, border: roleConfig.border, padding: "4px 12px", borderRadius: "20px", textShadow: darkMode ? "0 0 10px " + roleConfig.color + "66" : "none" }}>
                        {roleConfig.label}
                      </span>
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