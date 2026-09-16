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

      {/* Certificate UI - Menggunakan layout kotak bersarang agar border tidak pernah menabrak teks */}
      <div className="w-full max-w-4xl bg-white aspect-[1.414/1] shadow-2xl mx-auto p-4 md:p-6 print:w-full print:h-screen print:shadow-none print:p-8">
        
        {/* Bingkai Luar (Emas Tebal) */}
        <div className="w-full h-full border-[10px] md:border-[16px] border-double border-amber-500 p-2 md:p-3 relative">
          
          {/* Bingkai Dalam (Emas Tipis) */}
          <div className="w-full h-full border border-amber-400 relative flex flex-col overflow-hidden bg-white">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
            
            {/* Konten Utama (Aman di dalam kotak) */}
            <div className="flex-1 flex flex-col justify-between items-center py-6 px-8 md:py-10 md:px-12 text-center z-10">
              
              {/* Header */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-inner border border-amber-200">
                  <Award size={32} />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-serif text-slate-900 font-bold mb-1 md:mb-2 uppercase tracking-widest text-amber-900">Sertifikat Kelulusan</h1>
                <p className="text-[10px] md:text-sm text-slate-500 uppercase tracking-widest font-bold">CloudNetwork Virtual Lab - MikroTik Edition</p>
              </div>
              
              {/* Tengah - Penerima */}
              <div className="flex flex-col items-center justify-center w-full">
                <p className="text-slate-600 italic mb-2 text-sm md:text-base">Diberikan secara resmi kepada:</p>
                
                <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-3 md:mb-4 border-b-2 border-amber-300 pb-1 md:pb-2 px-8 md:px-12 inline-block capitalize">
                  {user.fullName || user.email.split('@')[0]}
                </h2>
                
                <p className="text-slate-600 max-w-2xl text-[10px] md:text-sm leading-relaxed mb-3 md:mb-4">
                  Telah berhasil menyelesaikan dan lulus dengan kualifikasi sangat memuaskan pada program pelatihan praktikum virtual:
                </p>
                
                <h3 className="text-sm md:text-xl font-bold text-blue-800 bg-blue-50 px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-blue-200 shadow-sm">
                  Dasar Routing IPv4 (MikroTik RouterOS)
                </h3>
              </div>
              
              {/* Footer - Tanda Tangan */}
              <div className="w-full flex justify-between items-end px-2 md:px-8 mt-2 md:mt-4">
                <div className="text-center flex flex-col items-center">
                  <div className="h-12 md:h-16 flex items-end justify-center mb-1">
                    {settings.signatureImage ? (
                      <img src={settings.signatureImage} alt="Tanda Tangan" className="h-10 md:h-14 object-contain" />
                    ) : (
                      <span className="font-['Brush_Script_MT',cursive,serif] text-2xl md:text-4xl text-slate-700 opacity-80 -rotate-6">Ttd.</span>
                    )}
                  </div>
                  <div className="border-b-2 border-slate-400 w-32 md:w-48 mb-1"></div>
                  <p className="text-[9px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">{settings.instructorName}</p>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-semibold">Instruktur Utama</p>
                </div>
                
                <div className="text-center flex flex-col items-center">
                  <div className="h-12 md:h-16 flex flex-col items-center justify-end mb-1">
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-mono mb-1">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                    <p className="text-[10px] md:text-sm font-bold text-slate-700 pb-1">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="border-b-2 border-slate-400 w-32 md:w-48 mb-1"></div>
                  <p className="text-[9px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Tanggal Terbit</p>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-semibold">CloudNetwork LMS System</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
