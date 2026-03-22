"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Absences() {
  const [students, setStudents] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [date, setDate] = useState("");

  const fetchStudents = async () => {
    const { data } = await supabase.from("Students").select("*");
    if (data) setStudents(data);
  };

  const fetchAbsences = async () => {
    const { data } = await supabase.from("absences").select("*");
    if (data) setAbsences(data);
  };

  useEffect(() => { fetchStudents(); fetchAbsences(); }, []);

  const addAbsence = async () => {
    if (!selectedStudent || !date) return;
    await supabase.from("absences").insert([{ student_id: selectedStudent, date }]);
    setSelectedStudent(""); setDate("");
    fetchAbsences();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 الغياب</h1>
        <a href="/dashboard" className="text-indigo-200 hover:text-white">← رجوع</a>
      </div>
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">تسجيل غياب</h2>
          <div className="grid grid-cols-2 gap-4">
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="border rounded-xl px-4 py-2 text-right">
              <option value="">اختار التلميذ</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.Nom} {s.Prenom}</option>
              ))}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border rounded-xl px-4 py-2" />
          </div>
          <button onClick={addAbsence}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl">
            تسجيل
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-indigo-700">رقم التلميذ</th>
                <th className="px-6 py-3 text-indigo-700">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-6 py-3">{a.student_id}</td>
                  <td className="px-6 py-3">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}