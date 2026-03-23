"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Parent() {
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [absences, setAbsences] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("student_id")
        .eq("id", userData.user?.id)
        .single();

      if (profile?.student_id) {
        const { data: studentData } = await supabase
          .from("Students")
          .select("*")
          .eq("id", profile.student_id)
          .single();
        setStudent(studentData);

        const { data: absData } = await supabase
          .from("absences")
          .select("*")
          .eq("student_id", profile.student_id);
        setAbsences(absData || []);

        const { data: gradesData } = await supabase
          .from("grades")
          .select("*")
          .eq("student_id", profile.student_id);
        setGrades(gradesData || []);
      }
    };
    getData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">👨‍👩‍👧 لوحة الولي</h1>
        <span className="text-purple-200">{user?.email}</span>
      </div>
      <div className="p-8">
        {student && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6 text-right">
            <h2 className="text-xl font-bold text-purple-700 mb-2">معلومات التلميذ</h2>
            <p className="text-gray-700">الاسم: <strong>{student.Nom} {student.Prenom}</strong></p>
            <p className="text-gray-700">الفصل: <strong>{student.Classe}</strong></p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-right">📋 الغياب ({absences.length})</h2>
            {absences.length === 0 ? (
              <p className="text-gray-500 text-center">لا غياب مسجل</p>
            ) : (
              <ul className="text-right">
                {absences.map((a) => (
                  <li key={a.id} className="border-b py-2 text-gray-700">{a.date}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-right">📊 النقط</h2>
            {grades.length === 0 ? (
              <p className="text-gray-500 text-center">لا نقط مسجلة</p>
            ) : (
              <ul className="text-right">
                {grades.map((g) => (
                  <li key={g.id} className="border-b py-2 text-gray-700">
                    {g.matiere}: <strong className="text-purple-600">{g.note}/20</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}