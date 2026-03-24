"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MessageSquare, Send, ArrowLeft, ArrowRight, Sun, Moon, Languages } from "lucide-react";
import { useApp } from "../context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Messages() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [content, setContent] = useState("");
  const [pressed, setPressed] = useState(false);
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
    msgSent: { background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.25)", borderRadius: "16px 16px 4px 16px" },
    msgReceived: { background: "rgba(30,41,59,0.9)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "16px 16px 16px 4px" },
    dropdown: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
    title: "#ffffff", titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtext: "#94a3b8", accent: "#60a5fa",
    activeLang: "rgba(34,211,238,0.1)", activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    inset: { background: "#f0f2f5", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "12px", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8)" },
    btn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    msgSent: { background: "#eff4ff", border: "1px solid rgba(79,110,247,0.2)", borderRadius: "16px 16px 4px 16px" },
    msgReceived: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px 16px 16px 4px" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    title: "#1a202c", titleShadow: "none",
    subtext: "#718096", accent: "#38b8c8",
    activeLang: "rgba(79,110,247,0.08)", activeLangColor: "#4f6ef7",
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
    await supabase.from("messages").insert([{ sender_id: currentUser.id, receiver_id: selectedUser, content }]);
    setContent("");
    fetchData();
  };

  const getProfile = (id: string) => profiles.find(p => p.id === id);
  const getRoleLabel = (role: string) => {
    if (role === "admin") return t("admin");
    if (role === "teacher") return t("teacher");
    return t("parent");
  };

  return (
    <div dir={dir} style={{ background: th.pageBg, minHeight: "100vh", fontFamily: "'Cairo', sans-serif", transition: "all 0.4s" }} className="p-4 md:p-8">

      {darkMode && <div style={{ position: "fixed", top: "5%", left: "30%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ ...th.card, padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/dashboard" style={{ ...th.btn, padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: th.accent, fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
              {dir === "rtl" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
              {t("back")}
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <div style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(96,165,250,0.12)" : "#f0fbff", border: darkMode ? "1px solid rgba(96,165,250,0.2)" : "none", boxShadow: darkMode ? "0 0 12px rgba(96,165,250,0.3)" : "0 2px 6px rgba(0,0,0,0.06)" }}>
                <MessageSquare size={18} color={th.accent} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: th.title, textShadow: th.titleShadow, whiteSpace: "nowrap" }}>{t("messages")}</h1>
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

        {/* New Message Form */}
        <div style={{ ...th.card, padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "16px", fontSize: "15px", textShadow: th.titleShadow }}>{t("newMessage")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500" }}>
                <option value="">{t("receiver")}</option>
                {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({getRoleLabel(p.role)})</option>
                ))}
              </select>
            </div>
            <div style={{ ...th.inset, padding: "12px 16px" }}>
              <textarea placeholder={t("writeMessage")} value={content} onChange={e => setContent(e.target.value)} rows={3}
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px", color: th.title, fontFamily: "'Cairo', sans-serif", fontWeight: "500", resize: "none" }} />
            </div>
            <button onClick={sendMessage} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
              style={{ background: darkMode ? "rgba(96,165,250,0.12)" : "rgba(56,184,200,0.1)", border: darkMode ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(56,184,200,0.35)", borderRadius: "14px", padding: "11px 22px", color: th.accent, fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s", transform: pressed ? "scale(0.98)" : "scale(1)", alignSelf: "flex-start" }}>
              <Send size={16} /> {t("send")}
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div style={{ ...th.card, padding: "24px" }}>
          <h2 style={{ fontWeight: "700", color: th.title, marginBottom: "20px", fontSize: "15px", textShadow: th.titleShadow }}>
            {t("conversations")} ({messages.length})
          </h2>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: th.subtext }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: darkMode ? "rgba(96,165,250,0.08)" : "#f0fbff" }}>
                <MessageSquare size={26} color={th.subtext} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>{t("noMessages")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map(m => {
                const isSent = m.sender_id === currentUser?.id;
                const otherProfile = getProfile(isSent ? m.receiver_id : m.sender_id);
                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isSent ? "flex-end" : "flex-start", gap: "4px" }}>
                    <p style={{ fontSize: "11px", color: th.subtext, fontWeight: "500", padding: "0 4px" }}>
                      {isSent ? t("me") : (otherProfile?.nom + " " + otherProfile?.prenom)}
                    </p>
                    <div style={{ ...(isSent ? th.msgSent : th.msgReceived), padding: "12px 16px", maxWidth: "75%" }}>
                      <p style={{ fontSize: "14px", color: isSent ? (darkMode ? "#22d3ee" : "#4f6ef7") : th.title, fontWeight: "500", lineHeight: 1.6 }}>
                        {m.content}
                      </p>
                      <p style={{ fontSize: "10px", color: th.subtext, marginTop: "6px", textAlign: isSent ? "end" : "start" }}>
                        {new Date(m.created_at).toLocaleTimeString(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US")}
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