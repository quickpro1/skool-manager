export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-700 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏫 Skool Manager</h1>
        <span className="text-indigo-200">لوحة المدير</span>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/students" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">👨‍🎓</div>
          <h2 className="text-xl font-bold text-indigo-700">التلاميذ</h2>
          <p className="text-gray-500 mt-1">إدارة التلاميذ</p>
        </a>
        <a href="/absences" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">📋</div>
          <h2 className="text-xl font-bold text-indigo-700">الغياب</h2>
          <p className="text-gray-500 mt-1">تسجيل الغياب</p>
        </a>
        <a href="/grades" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">📊</div>
          <h2 className="text-xl font-bold text-indigo-700">النقط</h2>
          <p className="text-gray-500 mt-1">إدخال النقط</p>
        </a>
        <a href="/users" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">👥</div>
          <h2 className="text-xl font-bold text-indigo-700">المستخدمين</h2>
          <p className="text-gray-500 mt-1">إدارة المستخدمين</p>
        </a>
        <a href="/messages" className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-2">💬</div>
          <h2 className="text-xl font-bold text-indigo-700">الرسائل</h2>
          <p className="text-gray-500 mt-1">التواصل الداخلي</p>
        </a>
      </div>
    </div>
  );
}