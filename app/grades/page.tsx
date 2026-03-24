"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { BookOpen, Plus, ArrowRight, Sun, Moon, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Grades() {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [matiere, setMatiere] = useState("");
  const [note, setNote] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const t = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
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
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    title: "#1a202c",
    titleShadow: "none",
    subtext: "#718096",
    accent: "#3db87a",
    accentGlow: "rgba(61,184,122,0.2)",
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  const fetchGrades = async () => {
    const { data } = await supabase.from("grades").select("*").order("id", { ascending: false });
    if (data) setGrades(data);
  };

  useEffect(() => { fetchStudents(); fetchGrades(); }, []);

  const addGrade = async () => {
    if (!selectedStudent || !matiere || !note) return;
    await supabase.from("grades").insert([{ student_id: selectedStudent, matiere, note: parseFloat(note) }]);
    setSelectedStudent(""); setMatiere(""); setNote("");
    fetchGrades();
  };

  const deleteGrade = async (id: number) => {
    await supabase.from("grades").delete().eq("id", id);
    fetchGrades();
  };

  const getStudentName = (id: string) => {
    const s = students.find(s => s.id === parseInt(id));
    return s ? s.Nom + " " + s.Prenom : "—";
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

  return (
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(163,230,53,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

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
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: t.title, textShadow: t.titleShadow }}>النقط</h1>
            <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(163,230,53,0.12)" : "#f0faf5", border: darkMode ? "1px solid rgba(163,230,53,0.2)" : "none", boxShadow: darkMode ? "0 0 14px rgba(163,230,53,0.3)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
              <BookOpen size={20} color={t.accent} />
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div style={{ ...t.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>إدخال نقطة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="">اختار التلميذ</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>)}
              </select>
            </div>
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <input placeholder="المادة" value={matiere} onChange={e => setMatiere(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <input type="number" placeholder="النقطة /20" value={note} onChange={e => setNote(e.target.value)} min="0" max="20"
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
          </div>
          <button
            onClick={addGrade}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            style={{
              background: darkMode ? "rgba(163,230,53,0.12)" : "rgba(61,184,122,0.1)",
              border: darkMode ? "1px solid rgba(163,230,53,0.35)" : "1px solid rgba(61,184,122,0.35)",
              borderRadius: "14px", padding: "11px 22px", color: t.accent, fontWeight: "700", fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              fontFamily: "'Cairo', sans-serif", transition: "all 0.2s",
              transform: pressed ? "scale(0.98)" : "scale(1)",
              boxShadow: darkMode ? "0 0 20px " + t.accentGlow : "none",
            }}
          >
            <Plus size={17} /> حفظ
          </button>
        </div>

        {/* Grades List */}
        <div style={{ ...t.card, padding: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>
            سجل النقط ({grades.length})
          </h2>

          {grades.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: t.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(163,230,53,0.08)" : "#f0faf5" }}>
                <BookOpen size={26} color={t.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>لا يوجد نقط مسجلة</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 40px", gap: "12px", padding: "8px 18px", marginBottom: "4px" }}>
                {["المادة", "التلميذ", "النقطة", ""].map((h, i) => (
                  <p key={i} style={{ textAlign: "right", fontSize: "11px", fontWeight: "700", color: t.subtext }}>{h}</p>
                ))}
              </div>
              {grades.map((g) => (
                <div
                  key={g.id}
                  style={{
                    ...t.row, padding: "14px 18px",
                    display: "grid", gridTemplateColumns: "1fr 1fr 80px 40px", gap: "12px", alignItems: "center",
                    transition: "all 0.2s",
                    transform: hoveredRow === g.id ? "scale(1.01)" : "scale(1)",
                    boxShadow: hoveredRow === g.id ? (darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)") : "none",
                  }}
                  onMouseEnter={() => setHoveredRow(g.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <p style={{ textAlign: "right", fontSize: "13px", color: t.subtext, fontWeight: "500" }}>{g.matiere}</p>
                  <p style={{ textAlign: "right", fontSize: "14px", color: t.title, fontWeight: "700", textShadow: darkMode ? t.titleShadow : "none" }}>{getStudentName(g.student_id)}</p>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span style={{
                      fontSize: "14px", fontWeight: "800", color: getNoteColor(g.note),
                      textShadow: darkMode ? "0 0 16px " + getNoteGlow(g.note) : "none",
                      background: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
                      padding: "4px 12px", borderRadius: "20px",
                      border: darkMode ? "1px solid " + getNoteColor(g.note) + "33" : "none",
                    }}>
                      {g.note}/20
                    </span>
                  </div>
                  <button onClick={() => deleteGrade(g.id)} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
                    <Trash2 size={14} color="#f87171" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}