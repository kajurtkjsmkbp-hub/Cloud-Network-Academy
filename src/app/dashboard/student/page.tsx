"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap, PlayCircle, Award, Star, Lock } from "lucide-react";
import Link from "next/link";
import { mikrotikModules } from "@/data/modules";

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUserStr = localStorage.getItem("lms_currentUser");
    if (currentUserStr) {
      const parsed = JSON.parse(currentUserStr);
      if (parsed.role !== "student") {
        router.push("/dashboard/teacher");
      } else {
        // Fetch fresh data from server
        fetch(`/api/users/${parsed.email}`)
          .then(res => res.json())
          .then(data => {
            if (data.error || !data.user) {
              localStorage.removeItem("lms_currentUser");
              router.push("/login");
              return;
            }
            
            const freshUser = data.user;
            if (freshUser.status === "suspended") {
              localStorage.removeItem("lms_currentUser");
              alert("Akun Anda telah dinonaktifkan sementara oleh Guru.");
              router.push("/login");
              return;
            }
            
            // Sync local storage with fresh DB data
            localStorage.setItem("lms_currentUser", JSON.stringify(freshUser));
            setUser(freshUser);
            setLoading(false);
          })
          .catch(err => {
            console.error("Gagal sinkronisasi", err);
            // Fallback to local
            setUser(parsed);
            setLoading(false);
          });
      }
    } else {
      router.push("/login");
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("lms_currentUser");
    router.push("/login");
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">Memuat...</div>;
  }

  const totalPoints = user.points || 0;
  const completedModules = user.completedModules || [];
  
  // Cek apakah seluruh modul (20 modul) sudah diselesaikan
  const isAllCompleted = completedModules.length === mikrotikModules.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-blue-600" />
          <h1 className="font-bold text-lg text-slate-900 dark:text-white">Dashboard Siswa</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{totalPoints} Poin</span>
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-white hidden sm:block">
            {user.fullName || user.email.split('@')[0]}
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-2">
        
        {/* Welcome Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user.fullName || user.email.split('@')[0]}! 👋</h2>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base">
            Siap untuk melanjutkan pembelajaran jaringan Anda? Pilih modul di bawah ini dan tingkatkan pemahaman praktis Anda mengenai RouterOS MikroTik.
          </p>
        </div>

        {/* Certificate Banner */}
        <div className={`mb-8 p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-center justify-between transition-all ${isAllCompleted ? 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-slate-900 dark:to-slate-800 border-amber-300 shadow-amber-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isAllCompleted ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Award size={32} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Sertifikat MikroTik Basic (MTCNA Prep)</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isAllCompleted ? "Selamat! Anda telah lulus dan berhak mendapatkan sertifikat." : "Selesaikan modul untuk membuka kunci sertifikat ini."}
              </p>
            </div>
          </div>
          
          {isAllCompleted ? (
            <Link href="/certificate" className="shrink-0 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105">
              Unduh Sertifikat
            </Link>
          ) : (
            <button disabled className="shrink-0 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-medium cursor-not-allowed flex items-center gap-2">
              <Lock size={18} /> Terkunci
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Kurikulum Pembelajaran (20 Modul)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mikrotikModules.map((modul, index) => {
            const isCompleted = completedModules.includes(modul.id);
            const isLocked = index > 0 && !completedModules.includes(mikrotikModules[index-1].id); // Kunci jika modul sebelumnya belum selesai

            return (
              <div key={modul.id} className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col ${isLocked ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isLocked ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                    {isLocked ? <Lock size={20} /> : <PlayCircle size={20} />}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isLocked ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-blue-100 text-blue-700 dark:bg-blue-900'}`}>
                    {isCompleted ? "Selesai" : `Modul ${index + 1}`}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{modul.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{modul.description}</p>
                
                {isLocked ? (
                  <button disabled className="w-full text-center py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed">
                    Selesaikan Modul Sebelumnya
                  </button>
                ) : (
                  <Link href={`/lab?modul=${modul.id}`} className={`w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {isCompleted ? "Ulangi Modul" : "Mulai Modul"}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <footer className="mt-4 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p className="font-medium">CloudNetwork Virtual Lab - MikroTik Edition - <span className="font-bold text-slate-700 dark:text-slate-300">Adiningtyas Yuli Purwanto, S.Kom</span></p>
      </footer>
    </div>
  );
}
