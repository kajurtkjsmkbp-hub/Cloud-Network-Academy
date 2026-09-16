"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Download, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { mikrotikModules } from "@/data/modules";

export default function CertificatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const isPreview = window.location.search.includes("preview=true");
    const currentUserStr = localStorage.getItem("lms_currentUser");
    
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
    if (user) {
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
        <Link href="/dashboard/student" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronLeft size={20} /> Kembali ke Dashboard
        </Link>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors"
        >
          <Download size={18} /> Unduh PDF
        </button>
      </div>

      {/* Certificate UI */}
      <div className="w-full max-w-4xl bg-white aspect-[1.414/1] rounded-sm shadow-2xl relative overflow-hidden print:shadow-none print:w-full print:h-screen mx-auto flex flex-col">
        {/* Bingkai Luar dan Dalam */}
        <div className="absolute inset-6 border-[12px] border-double border-amber-500 opacity-80 pointer-events-none z-20"></div>
        <div className="absolute inset-10 border border-amber-400 opacity-50 pointer-events-none z-20"></div>
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
        
        {/* Konten Utama - Menggunakan inset-12 agar dipastikan SELALU berada di DALAM bingkai (inset-6 & inset-10) */}
        <div className="absolute inset-12 z-10 flex flex-col justify-between items-center py-6 px-10 text-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mt-2">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-inner border border-amber-200">
              <Award size={32} />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif text-slate-900 font-bold mb-2 uppercase tracking-widest text-amber-900">Sertifikat Kelulusan</h1>
            <p className="text-xs md:text-sm text-slate-500 uppercase tracking-widest font-bold">CloudNetwork Virtual Lab - MikroTik Edition</p>
          </div>
          
          {/* Tengah - Penerima */}
          <div className="flex flex-col items-center justify-center flex-1 my-2">
            <p className="text-slate-600 italic mb-2">Diberikan secara resmi kepada:</p>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 border-b-2 border-amber-300 pb-2 px-12 inline-block capitalize">
              {user.fullName || user.email.split('@')[0]}
            </h2>
            
            <p className="text-slate-600 max-w-2xl text-xs md:text-sm leading-relaxed mb-4">
              Telah berhasil menyelesaikan dan lulus dengan kualifikasi sangat memuaskan pada program pelatihan praktikum virtual:
            </p>
            
            <h3 className="text-lg md:text-xl font-bold text-blue-800 bg-blue-50 px-6 py-2 rounded-full border border-blue-200 shadow-sm">
              Dasar Routing IPv4 (MikroTik RouterOS)
            </h3>
          </div>
          
          {/* Footer - Tanda Tangan (Terletak di bawah karena justify-between) */}
          <div className="w-full flex justify-between items-end px-2 md:px-8 mt-auto mb-2">
            <div className="text-center flex flex-col items-center">
              <div className="h-16 flex items-end justify-center mb-1">
                {/* Tanda tangan (font cursive) */}
                <span className="font-['Brush_Script_MT',cursive,serif] text-3xl md:text-4xl text-slate-700 opacity-80 -rotate-6">Adiningtyas</span>
              </div>
              <div className="border-b-2 border-slate-400 w-40 md:w-48 mb-1"></div>
              <p className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Adiningtyas Yuli Purwanto, S.Kom</p>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">Instruktur Utama</p>
            </div>
            
            <div className="text-center flex flex-col items-center">
              <div className="h-16 flex flex-col items-center justify-end mb-1">
                <p className="text-[9px] md:text-[10px] text-slate-400 font-mono mb-1">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                <p className="text-xs md:text-sm font-bold text-slate-700 pb-1">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="border-b-2 border-slate-400 w-40 md:w-48 mb-1"></div>
              <p className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-wider">Tanggal Terbit</p>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-semibold">CloudNetwork LMS System</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
