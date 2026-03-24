"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Mail, Lock, LogIn, Sun, Moon, Languages } from "lucide-react";
import { useApp } from "./context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { darkMode, setDarkMode, lang, setLang, t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const isRTL = lang === "ar";

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(t("wrongCredentials")); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "teacher") window.location.href = "/teacher";
    else if (profile?.role === "parent") window.location.href = "/parent";
    else window.location.href = "/dashboard";
    setLoading(false);
  };

  const th = darkMode ? {
    pageBg: "#0f172a",
    glow: "rgba(34,211,238,0.06)",
    card: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "24px", padding: "32px", boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" },
    input: { background: "#0f172a", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "13px 44px" },
    title: "#ffffff",
    titleShadow: "0 0 10px rgba(255,255,255,0.1)",
    subtitle: "#94a3b8",
    inputText: "#e2e8f0",
    placeholderColor: "#64748b",
    btn: { background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.35)", color: "#22d3ee", boxShadow: "0 0 24px rgba(34,211,238,0.12)" },
    toggleBtn: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
    dropdown: { background: "#1e293b", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
    activeLang: "rgba(34,211,238,0.1)",
    activeLangColor: "#22d3ee",
  } : {
    pageBg: "#f0f2f5",
    glow: "rgba(79,110,247,0.06)",
    card: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
    input: { background: "#f8fafc", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "14px", padding: "13px 44px" },
    title: "#1a202c",
    titleShadow: "none",
    subtitle: "#718096",
    inputText: "#2d3748",
    placeholderColor: "#a0aec0",
    btn: { background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.35)", color: "#4f6ef7", boxShadow: "0 4px 12px rgba(79,110,247,0.12)" },
    toggleBtn: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    dropdown: { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
    activeLang: "rgba(79,110,247,0.08)",
    activeLangColor: "#4f6ef7",
  };

  const langs = [
    { code: "ar", label: "العربية", short: "AR" },
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
  ];

  return (
    <div style={{ background: th.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif", padding: "16px", transition: "all 0.4s", position: "relative" }}>

      <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse at center, " + th.glow + " 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Controls */}
      <div style={{ position: "fixed", top: "20px", left: "20px", display: "flex", gap: "8px", zIndex: 10 }}>
        {/* Dark Mode */}
        <button onClick={() => setDarkMode(!darkMode)} style={{ ...th.toggleBtn, width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
          <div style={{ transition: "transform 0.5s", transform: darkMode ? "rotate(360deg)" : "rotate(0deg)" }}>
            {darkMode ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#4f6ef7" />}
          </div>
        </button>

        {/* Language */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowLang(!showLang)}
            style={{ ...th.toggleBtn, height: "44px", padding: "0 14px", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer", transition: "all 0.3s" }}>
            <Languages size={15} color={darkMode ? "#94a3b8" : "#718096"} />
            <span style={{ fontSize: "12px", fontWeight: "800", color: darkMode ? "#22d3ee" : "#4f6ef7", letterSpacing: "0.5px" }}>
              {langs.find(l => l.code === lang)?.short}
            </span>
          </button>
          {showLang && (
            <div style={{ ...th.dropdown, position: "absolute", top: "52px", left: 0, minWidth: "140px", padding: "6px", zIndex: 100 }}>
              {langs.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code as any); setShowLang(false); }}
                  style={{ width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: "10px", background: lang === l.code ? th.activeLang : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cairo', sans-serif", transition: "all 0.15s" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: lang === l.code ? th.activeLangColor : (darkMode ? "#64748b" : "#a0aec0"), background: lang === l.code ? th.activeLang : (darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"), padding: "2px 7px", borderRadius: "6px", letterSpacing: "0.5px" }}>
                    {l.code.toUpperCase()}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: lang === l.code ? th.activeLangColor : (darkMode ? "#94a3b8" : "#718096") }}>
                    {l.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", marginBottom: "10px" }}>🏫</div>
          <h1 style={{ fontSize: "25px", fontWeight: "800", color: th.title, letterSpacing: "-0.5px", textShadow: th.titleShadow }}>{t("appName")}</h1>
          <p style={{ color: th.subtitle, fontSize: "13px", marginTop: "5px", fontWeight: "500" }}>
            {lang === "ar" ? "نظام إدارة المدارس الخصوصية" : lang === "fr" ? "Système de gestion scolaire" : "School Management System"}
          </p>
        </div>

        {/* Card */}
        <div style={{ ...th.card, transition: "all 0.4s" }}>
          <h2 style={{ textAlign: "center", fontWeight: "700", color: th.title, marginBottom: "22px", fontSize: "17px", textShadow: th.titleShadow }}>
            {t("login")}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Email Input */}
            <div style={{ ...th.input, display: "flex", alignItems: "center", position: "relative", direction: isRTL ? "rtl" : "ltr" }}>
              <Mail size={16} color={th.placeholderColor} style={{ position: "absolute", [isRTL ? "left" : "right"]: "14px", flexShrink: 0 }} />
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  width: "100%", fontSize: "14px",
                  color: th.inputText,
                  fontFamily: "'Cairo', sans-serif", fontWeight: "500",
                  textAlign: isRTL ? "right" : "left",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ ...th.input, display: "flex", alignItems: "center", position: "relative", direction: isRTL ? "rtl" : "ltr" }}>
              <Lock size={16} color={th.placeholderColor} style={{ position: "absolute", [isRTL ? "left" : "right"]: "14px", flexShrink: 0 }} />
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  width: "100%", fontSize: "14px",
                  color: th.inputText,
                  fontFamily: "'Cairo', sans-serif", fontWeight: "500",
                  textAlign: isRTL ? "right" : "left",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "12px", padding: "10px 14px", textAlign: "center" }}>
                <p style={{ color: "#f87171", fontSize: "13px", fontWeight: "600" }}>{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button onClick={handleLogin} disabled={loading}
              style={{ ...th.btn, borderRadius: "14px", padding: "14px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'Cairo', sans-serif", transition: "all 0.2s", opacity: loading ? 0.7 : 1 }}>
              <LogIn size={17} />
              {loading ? t("loading") : t("enter")}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: th.subtitle, fontSize: "11px", marginTop: "20px", fontWeight: "500" }}>
          Skool Manager © 2025
        </p>
      </div>
    </div>
  );
}