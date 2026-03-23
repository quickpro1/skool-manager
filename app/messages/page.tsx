"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setCurrentUser(userData.user);

    const { data: profilesData } = await supabase.from("profiles").select("*");
    if (profilesData) setProfiles(profilesData);

    if (userData.user) {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">💬 الرسائل</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4 text-right">رسالة جديدة</h2>
          <div className="space-y-3">
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 text-right">
              <option value="">اختار المستلم</option>
              {profiles.filter(p => p.id !== currentUser?.id).map(p => (
                <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.role === "teacher" ? "أستاذ" : p.role === "parent" ? "ولي" : "مدير"})</option>
              ))}
            </select>
            <textarea
              placeholder="اكتب رسالتك هنا..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 text-right h-24 resize-none"
            />
            <button onClick={sendMessage}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl">
              إرسال
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === currentUser?.id ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-3 ${m.sender_id === currentUser?.id ? "bg-indigo-600 text-white" : "bg-white shadow"}`}>
                <p className="text-sm font-bold mb-1">
                  {m.sender_id === currentUser?.id ? "أنا" : `${getProfile(m.sender_id)?.nom || ""}`}
                </p>
                <p>{m.content}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString("ar")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}