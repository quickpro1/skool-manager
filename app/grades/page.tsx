"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  const fetchGrades = async () => {
    const { data } = await supabase.from("grades").select("*");
    if (data) setGrades(data);
  };

  useEffect(() => { fetchStudents(); fetchGrades(); }, []);

  const addGrade = async () => {
    if (!selectedStudent || !matiere || !note) return;
    await supabase.from("grades").insert([{ student_id: selectedStudent, matiere, note }]);
    setSelectedStudent(""); setMatiere(""); setNote("");
    fetchGrades();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 النقط</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">إدخال نقطة</h2>
          <div className="grid grid-cols-3 gap-4">
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right">
              <option value="">اختار التلميذ</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>
              ))}
            </select>
            <input placeholder="المادة" value={matiere} onChange={e => setMatiere(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" />
            <input type="number" placeholder="النقطة /20" value={note} onChange={e => setNote(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right" min="0" max="20" />
          </div>
          <button onClick={addGrade}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl">
            حفظ
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-indigo-700">رقم التلميذ</th>
                <th className="px-6 py-3 text-indigo-700">المادة</th>
                <th className="px-6 py-3 text-indigo-700">النقطة</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="px-6 py-3">{g.student_id}</td>
                  <td className="px-6 py-3">{g.matiere}</td>
                  <td className="px-6 py-3 font-bold text-indigo-600">{g.note}/20</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}