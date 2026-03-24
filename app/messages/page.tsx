"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MessageSquare, Send, ArrowRight, Sun, Moon } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Messages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [pressed, setPressed] = useState(false);

  const t = darkMode ? {
    pageBg: "#0f172a",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "18px", boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    inset: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px" },
    btn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    msgSent: { background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.25)", borderRadius: "16px 16px 4px 16px" },
    msgReceived: { background: "rgba(30,41,59,0.9)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "16px 16px 16px 4px" },
    title: "#ffffff",
    titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8",
    accent: "#60a5fa",
    accentGlow: "rgba(96,165,250,0.3)",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    msgSent: { background: "#eff4ff", border: "1px solid rgba(79,110,247,0.2)", borderRadius: "16px 16px 4px 16px" },
    msgReceived: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px 16px 16px 4px" },
    title: "#1a202c",
    titleShadow: "none",
    subtext: "#718096",
    accent: "#38b8c8",
    accentGlow: "rgba(56,184,200,0.2)",
  };

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setCurrentUser(userData.user);
    const { data: profilesData } = await supabase.from("profiles").select("*");
    if (profilesData) setProfiles(profilesData);
    if (userData.user) {
      const { data: messagesData } = await supabase
        .from("messages").select("*")
        .or("sender_id.eq." + userData.user.id + ",receiver_id.eq." + userData.user.id)
        .order("created_at", { ascending: true });
      if (messagesData) setMessages(messagesData);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const sendMessage = async () => {
    if (!content || !selectedUser) return;
    await supabase.from("messages").insert([{
      sender_id: currentUser.id,
      receiver_id: selectedUser,
      content
    }]);
    setContent("");
    fetchData();
  };

  const getProfile = (id: string) => profiles.find(p => p.id === id);

  const getRoleLabel = (role: string) => {
    if (role === "admin") return "مدير";
    if (role === "teacher") return "أستاذ";
    return "ولي";
  };

  return (
    <div style={{ background: t.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>

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
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: t.title, textShadow: t.titleShadow }}>الرسائل</h1>
            <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(96,165,250,0.12)" : "#f0fbff", border: darkMode ? "1px solid rgba(96,165,250,0.2)" : "none", boxShadow: darkMode ? "0 0 14px rgba(96,165,250,0.3)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
              <MessageSquare size={20} color={t.accent} />
            </div>
          </div>
        </div>

        {/* New Message Form */}
        <div style={{ ...t.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "16px", fontSize: "15px", textShadow: t.titleShadow }}>رسالة جديدة</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="">اختار المستلم</option>
                {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({getRoleLabel(p.role)})</option>
                ))}
              </select>
            </div>
            <div style={{ ...t.inset, padding: "12px 16px" }}>
              <textarea
                placeholder="اكتب رسالتك هنا..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", textAlign: "right", fontSize: "14px", color: t.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500", resize: "none" }}
              />
            </div>
            <button
              onClick={sendMessage}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              style={{
                background: darkMode ? "rgba(96,165,250,0.12)" : "rgba(56,184,200,0.1)",
                border: darkMode ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(56,184,200,0.35)",
                borderRadius: "14px", padding: "11px 22px", color: t.accent, fontWeight: "700", fontSize: "14px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                fontFamily: "'Cairo', sans-serif", transition: "all 0.2s",
                transform: pressed ? "scale(0.98)" : "scale(1)",
                boxShadow: darkMode ? "0 0 20px " + t.accentGlow : "none",
                alignSelf: "flex-start",
              }}
            >
              <Send size={16} /> إرسال
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div style={{ ...t.card, padding: "24px" }}>
          <h2 style={{ textAlign: "right", fontWeight: "700", color: t.title, marginBottom: "20px", fontSize: "15px", textShadow: t.titleShadow }}>
            المحادثات ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: t.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(96,165,250,0.08)" : "#f0fbff" }}>
                <MessageSquare size={26} color={t.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>لا توجد رسائل بعد</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map(m => {
                const isSent = m.sender_id === currentUser?.id;
                const otherProfile = getProfile(isSent ? m.receiver_id : m.sender_id);
                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isSent ? "flex-start" : "flex-end", gap: "4px" }}>
                    <p style={{ fontSize: "11px", color: t.subtext, fontWeight: "500", padding: "0 4px" }}>
                      {isSent ? "أنا" : (otherProfile?.nom + " " + otherProfile?.prenom)}
                    </p>
                    <div style={{ ...(isSent ? t.msgSent : t.msgReceived), padding: "12px 16px", maxWidth: "75%" }}>
                      <p style={{ fontSize: "14px", color: isSent ? (darkMode ? "#22d3ee" : "#4f6ef7") : t.title, fontWeight: "500", lineHeight: 1.6, textShadow: isSent && darkMode ? "0 0 10px rgba(34,211,238,0.3)" : "none" }}>
                        {m.content}
                      </p>
                      <p style={{ fontSize: "10px", color: t.subtext, marginTop: "6px", textAlign: isSent ? "left" : "right" }}>
                        {new Date(m.created_at).toLocaleTimeString("ar-MA")}
                      </p>
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