"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Download, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { mikrotikModules } from "@/data/modules";

export default function CertificatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>({ instructorName: "Adiningtyas Yuli Purwanto, S.Kom", signatureImage: "" });

  useEffect(() => {
    const isPreview = window.location.search.includes("preview=true");
    const currentUserStr = localStorage.getItem("lms_currentUser");
    const settingsStr = localStorage.getItem("lms_settings");
    
    if (settingsStr) {
      const parsedSettings = JSON.parse(settingsStr);
      setSettings({
        instructorName: parsedSettings.instructorName || "Adiningtyas Yuli Purwanto, S.Kom",
        signatureImage: parsedSettings.signatureImage || ""
      });
    }
    
    if (currentUserStr) {
      const parsed = JSON.parse(currentUserStr);
      
      // Jika mode preview diaktifkan (khusus guru)
      if (isPreview && parsed.role === "teacher") {
        setUser({ 
          email: 'contoh@siswa.com', 
          fullName: 'Nama Siswa Contoh',
          completedModules: new Array(mikrotikModules.length).fill('modul')
        });
        return;
      }

      if (parsed.role !== "student") {
        router.push("/dashboard/teacher");
      } else if (!parsed.completedModules || parsed.completedModules.length < mikrotikModules.length) {
        router.push("/dashboard/student");
      } else {
        setUser(parsed);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleDownload = () => {
    if (user && !window.location.search.includes("preview=true")) {
      const updatedUser = { ...user, hasDownloadedCertificate: true };
      setUser(updatedUser);
      localStorage.setItem("lms_currentUser", JSON.stringify(updatedUser));
      
      const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
      const updatedUsers = allUsers.map((u: any) => 
        u.email === user.email ? updatedUser : u
      );
      localStorage.setItem("lms_users", JSON.stringify(updatedUsers));
    }
    window.print();
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronLeft size={20} /> Kembali
        </button>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors"
        >
          <Download size={18} /> Unduh PDF
        </button>
      </div>

      {/* Certificate UI - Menggunakan layout bersarang dengan padding vertikal lebih ringkas agar tidak terpotong (cut-off) */}
      <div className="w-full max-w-4xl bg-white aspect-[1.414/1] shadow-2xl mx-auto p-3 md:p-4 print:w-full print:h-screen print:shadow-none print:p-8">
        
        {/* Bingkai Luar (Emas Tebal) */}
        <div className="w-full h-full border-[8px] md:border-[12px] border-double border-amber-500 p-1 md:p-2 relative">
          
          {/* Bingkai Dalam (Emas Tipis) */}
          <div className="w-full h-full border border-amber-400 relative flex flex-col overflow-hidden bg-white">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
            
            {/* Konten Utama (Aman di dalam kotak, padding vertikal dikurangi) */}
            <div className="flex-1 flex flex-col justify-between items-center py-4 px-6 md:py-6 md:px-10 text-center z-10">
              
              {/* Header */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-2 shadow-inner border border-amber-200">
                  <Award size={28} />
                </div>
                
                <h1 className="text-2xl md:text-4xl font-serif text-slate-900 font-bold mb-1 uppercase tracking-widest text-amber-900">Sertifikat Kelulusan</h1>
                <p className="text-[9px] md:text-xs text-slate-500 uppercase tracking-widest font-bold">CloudNetwork Virtual Lab - MikroTik Edition</p>
              </div>
              
              {/* Tengah - Penerima */}
              <div className="flex flex-col items-center justify-center w-full">
                <p className="text-slate-600 italic mb-1 md:mb-2 text-xs md:text-sm">Diberikan secara resmi kepada:</p>
                
                <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-2 md:mb-3 border-b-2 border-amber-300 pb-1 md:pb-2 px-8 inline-block capitalize">
                  {user.fullName || user.email.split('@')[0]}
                </h2>
                
                <p className="text-slate-600 max-w-2xl text-[9px] md:text-xs leading-relaxed mb-2 md:mb-3">
                  Telah berhasil menyelesaikan dan lulus dengan kualifikasi sangat memuaskan pada program pelatihan praktikum virtual:
                </p>
                
                <h3 className="text-xs md:text-lg font-bold text-blue-800 bg-blue-50 px-4 md:px-6 py-1 md:py-1.5 rounded-full border border-blue-200 shadow-sm">
                  Dasar Routing IPv4 (MikroTik RouterOS)
                </h3>
              </div>
              
              {/* Footer - Tanda Tangan */}
              <div className="w-full flex justify-between items-end px-2 md:px-8 mt-1">
                <div className="text-center flex flex-col items-center relative">
                  
                  {/* STEMPEL MIKROTIK ACADEMY */}
                  <div className="absolute opacity-60 pointer-events-none z-0" style={{ left: '-5%', top: '-30%' }}>
                    <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-32 md:h-32 text-indigo-700 transform -rotate-12 mix-blend-multiply">
                      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                      
                      <text x="60" y="52" fontSize="12" fontWeight="900" fill="currentColor" textAnchor="middle" letterSpacing="1">MIKROTIK</text>
                      <text x="60" y="68" fontSize="16" fontWeight="900" fill="currentColor" textAnchor="middle" letterSpacing="1">ACADEMY</text>
                      
                      <line x1="25" y1="78" x2="95" y2="78" stroke="currentColor" strokeWidth="1.5" />
                      <text x="60" y="90" fontSize="8" fontWeight="bold" fill="currentColor" textAnchor="middle" letterSpacing="2">INSTRUCTOR</text>
                    </svg>
                  </div>
                  
                  <div className="h-12 md:h-20 flex items-end justify-center mb-0 md:mb-1">
                    {settings.signatureImage ? (
                      <img src={settings.signatureImage} alt="Tanda Tangan" className="h-16 md:h-24 object-contain mix-blend-multiply transform translate-y-1 md:translate-y-2" />
                    ) : (
                      <span className="font-['Brush_Script_MT',cursive,serif] text-2xl md:text-4xl text-slate-700 opacity-80 -rotate-6 transform translate-y-1">Ttd.</span>
                    )}
                  </div>
                  <div className="border-b-2 border-slate-400 w-32 md:w-48 mb-1"></div>
                  <p className="text-[8px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">{settings.instructorName}</p>
                  <p className="text-[7px] md:text-[9px] text-slate-500 font-semibold">Instruktur Utama</p>
                </div>
                
                <div className="text-center flex flex-col items-center">
                  <div className="h-10 md:h-14 flex flex-col items-center justify-end mb-1">
                    <p className="text-[7px] md:text-[9px] text-slate-400 font-mono mb-1">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                    <p className="text-[9px] md:text-xs font-bold text-slate-700 pb-1">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="border-b-2 border-slate-400 w-28 md:w-40 mb-1"></div>
                  <p className="text-[8px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Tanggal Terbit</p>
                  <p className="text-[7px] md:text-[9px] text-slate-500 font-semibold">CloudNetwork LMS System</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
