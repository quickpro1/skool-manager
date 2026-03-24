"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ClipboardList, Plus, ArrowRight, Sun, Moon, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Absences() {
  const [students, setStudents] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState("");
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
    accent: "#f87171",
    accentGlow: "rgba(248,113,113,0.3)",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    row: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px" },
    title: "#1a202c",
    titleShadow: "none",
    subtext: "#718096",
    accent: "#e05c5c",
    accentGlow: "rgba(224,92,92,0.2)",
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  const fetchAbsences = async () => {
    const { data } = await supabase.from("absences").select("*").order("created_at", { ascending: false });
    if (data) setAbsences(data);
  };

  useEffect(() => { fetchStudents(); fetchAbsences(); }, []);

  const addAbsence = async () => {
    if (!selectedStudent || !date) return;
    await supabase.from("absences").insert([{ student_id: selectedStudent, date }]);
    setSelectedStudent(""); setDate("");
    fetchAbsences();
  };

  const deleteAbsence = async (id: number) => {
    await supabase.from("absences").delete().eq("id", id);
    fetchAbsences();
  };

  const getStudentName = (id: string) => {
    const s = students.find(s => s.id === parseInt(id));
    return s ? s.Nom + " " + s.Prenom : "—";
  };

  return (
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(248,113,113,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

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
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: t.title, textShadow: t.titleShadow }}>الغياب</h1>
            <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(248,113,113,0.12)" : "#fff3f3", border: darkMode ? "1px solid rgba(248,113,113,0.2)" : "none", boxShadow: darkMode ? "0 0 14px rgba(248,113,113,0.3)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
              <ClipboardList size={20} color={t.accent} />
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div style={{ ...t.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>تسجيل غياب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="">اختار التلميذ</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>)}
              </select>
            </div>
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }} />
            </div>
          </div>
          <button
            onClick={addAbsence}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            style={{
              background: darkMode ? "rgba(248,113,113,0.12)" : "rgba(224,92,92,0.1)",
              border: darkMode ? "1px solid rgba(248,113,113,0.35)" : "1px solid rgba(224,92,92,0.35)",
              borderRadius: "14px", padding: "11px 22px", color: t.accent, fontWeight: "700", fontSize: "14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              fontFamily: "'Cairo', sans-serif", transition: "all 0.2s",
              transform: pressed ? "scale(0.98)" : "scale(1)",
              boxShadow: darkMode ? "0 0 20px " + t.accentGlow : "none",
            }}
          >
            <Plus size={17} /> تسجيل
          </button>
        </div>

        {/* Absences List */}
        <div style={{ ...t.card, padding: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>
            سجل الغياب ({absences.length})
          </h2>

          {absences.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: t.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(248,113,113,0.08)" : "#fff3f3" }}>
                <ClipboardList size={26} color={t.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>لا يوجد غياب مسجل</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "12px", padding: "8px 18px", marginBottom: "4px" }}>
                {["التاريخ", "التلميذ", ""].map((h, i) => (
                  <p key={i} style={{ textAlign: "right", fontSize: "11px", fontWeight: "700", color: t.subtext }}>{h}</p>
                ))}
              </div>
              {absences.map((a) => (
                <div
                  key={a.id}
                  style={{
                    ...t.row, padding: "14px 18px",
                    display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "12px", alignItems: "center",
                    transition: "all 0.2s",
                    transform: hoveredRow === a.id ? "scale(1.01)" : "scale(1)",
                    boxShadow: hoveredRow === a.id ? (darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)") : "none",
                  }}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <p style={{ textAlign: "right", fontSize: "13px", color: t.subtext, fontWeight: "500" }}>{a.date}</p>
                  <p style={{ textAlign: "right", fontSize: "14px", color: t.title, fontWeight: "700", textShadow: darkMode ? t.titleShadow : "none" }}>{getStudentName(a.student_id)}</p>
                  <button onClick={() => deleteAbsence(a.id)} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
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