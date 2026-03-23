"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Users() {
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
    
    if (error) {
      setMessage("خطأ: " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([{
        id: data.user.id,
        role,
        nom,
        prenom,
        student_id: role === "parent" ? parseInt(studentId) : null
      }]);
    }

    setMessage("✅ تمت إضافة المستخدم بنجاح!");
    setEmail(""); setPassword(""); setNom(""); setPrenom(""); setStudentId("");
    fetchProfiles();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 إدارة المستخدمين</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4 text-right">إضافة مستخدم جديد</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="الاسم" value={nom} onChange={e => setNom(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input placeholder="النسب" value={prenom} onChange={e => setPrenom(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input type="email" placeholder="الإيميل" value={email} onChange={e => setEmail(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input type="password" placeholder="كلمة السر" value={password} onChange={e => setPassword(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <select value={role} onChange={e => setRole(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right">
              <option value="teacher">أستاذ</option>
              <option value="parent">ولي</option>
              <option value="admin">مدير</option>
            </select>
            {role === "parent" && (
              <select value={studentId} onChange={e => setStudentId(e.target.value)}
                className="border rounded-xl px-4 py-2 text-right">
                <option value="">اختار التلميذ</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>
                ))}
              </select>
            )}
          </div>
          {message && <p className="mt-3 text-center text-green-600 font-bold">{message}</p>}
          <button onClick={addUser} disabled={loading}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl">
            {loading ? "جاري الإضافة..." : "إضافة"}
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-indigo-700">الاسم</th>
                <th className="px-6 py-3 text-indigo-700">النسب</th>
                <th className="px-6 py-3 text-indigo-700">الدور</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-6 py-3">{p.nom}</td>
                  <td className="px-6 py-3">{p.prenom}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${
                      p.role === "admin" ? "bg-indigo-500" :
                      p.role === "teacher" ? "bg-green-500" : "bg-purple-500"
                    }`}>
                      {p.role === "admin" ? "مدير" : p.role === "teacher" ? "أستاذ" : "ولي"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}