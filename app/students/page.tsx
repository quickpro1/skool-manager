"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classe, setClasse] = useState("");

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  useEffect(() => { fetchStudents(); }, []);

  const addStudent = async () => {
    if (!nom || !prenom || !classe) return;
    await supabase.from("Students").insert([{ Nom: nom, Prenom: prenom, Classe: classe }]);
    setNom(""); setPrenom(""); setClasse("");
    fetchStudents();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">👨‍🎓 التلاميذ</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">إضافة تلميذ جديد</h2>
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="الاسم" value={nom} onChange={e => setNom(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input placeholder="النسب" value={prenom} onChange={e => setPrenom(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input placeholder="الفصل" value={classe} onChange={e => setClasse(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
          </div>
          <button onClick={addStudent}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl">
            إضافة
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-indigo-700">الاسم</th>
                <th className="px-6 py-3 text-indigo-700">النسب</th>
                <th className="px-6 py-3 text-indigo-700">الفصل</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-6 py-3">{s.Nom}</td>
                  <td className="px-6 py-3">{s.Prenom}</td>
                  <td className="px-6 py-3">{s.Classe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}