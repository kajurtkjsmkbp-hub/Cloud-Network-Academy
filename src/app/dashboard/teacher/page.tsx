"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Users, Star } from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    const currentUserStr = localStorage.getItem("lms_currentUser");
    if (currentUserStr) {
      const parsed = JSON.parse(currentUserStr);
      if (parsed.role !== "teacher") {
        router.push("/dashboard/student");
      } else {
        setUserEmail(parsed.email);
        
        // Load all users to show students
        const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
        setStudentsList(allUsers.filter((u: any) => u.role === "student"));
      }
    } else {
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("lms_currentUser");
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" />
          <h1 className="font-bold text-lg text-slate-900 dark:text-white">Dashboard Guru</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">{userEmail}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition-colors group">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Total {studentsList.length} Siswa Terdaftar</h3>
            <p className="text-sm text-slate-500 mt-2">Pantau perkembangan dan skor siswa Anda.</p>
          </div>
        </div>

        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Laporan Nilai Siswa (Praktek Lab)</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Email Siswa</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Total Poin</th>
                <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Status Kelulusan Modul 1</th>
              </tr>
            </thead>
            <tbody>
              {studentsList.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada siswa yang mendaftar.</td></tr>
              ) : (
                studentsList.map((student, idx) => {
                  const isPassed = student.completedModules?.includes("modul1");
                  const points = student.points || 0;
                  
                  return (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">{student.email}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Star size={14} className="fill-amber-500" /> {points}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isPassed ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full text-xs font-bold">LULUS</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold">BELUM</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
