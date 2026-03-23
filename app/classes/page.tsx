"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Classes() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [niveau, setNiveau] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*");
    if (data) setClasses(data);
  };

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "teacher");
    if (data) setTeachers(data);
  };

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const addClass = async () => {
    if (!nom || !niveau) return;
    await supabase.from("classes").insert([{
      nom,
      niveau,
      teacher_id: teacherId || null
    }]);
    setNom(""); setNiveau(""); setTeacherId("");
    fetchClasses();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏫 الأقسام</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4 text-right">إضافة قسم جديد</h2>
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="اسم القسم (مثال: 6 أ)" value={nom} onChange={e => setNom(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input placeholder="المستوى (مثال: 6 ابتدائي)" value={niveau} onChange={e => setNiveau(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right">
              <option value="">اختار الأستاذ</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>
              ))}
            </select>
          </div>
          <button onClick={addClass}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl">
            إضافة
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-indigo-700">اسم القسم</th>
                <th className="px-6 py-3 text-indigo-700">المستوى</th>
                <th className="px-6 py-3 text-indigo-700">الأستاذ</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-6 py-3 font-bold text-indigo-600">{c.nom}</td>
                  <td className="px-6 py-3">{c.niveau}</td>
                  <td className="px-6 py-3">
                    {teachers.find(t => t.id === c.teacher_id)?.nom || "غير محدد"}
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