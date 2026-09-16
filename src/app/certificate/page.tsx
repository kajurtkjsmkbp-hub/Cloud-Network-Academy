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
    const currentUserStr = localStorage.getItem("lms_currentUser");
    if (currentUserStr) {
      const parsed = JSON.parse(currentUserStr);
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
      <div className="w-full max-w-4xl bg-white aspect-[1.414/1] rounded-sm shadow-2xl p-2 relative overflow-hidden print:shadow-none print:w-full print:h-screen">
        <div className="absolute inset-0 border-[16px] border-double border-amber-500 m-8 opacity-80 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="h-full w-full flex flex-col items-center justify-center p-16 text-center z-10 relative">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Award size={40} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 font-bold mb-2 uppercase tracking-widest text-amber-900">Sertifikat Kelulusan</h1>
          <p className="text-lg text-slate-500 mb-8 uppercase tracking-widest">CloudNetwork Academy</p>
          
          <p className="text-slate-600 italic mb-4">Diberikan secara resmi kepada:</p>
          
          <h2 className="text-4xl font-bold text-slate-800 mb-4 border-b-2 border-amber-300 pb-2 px-12 inline-block">
            {user.email.split('@')[0].toUpperCase()}
          </h2>
          
          <p className="text-slate-600 max-w-2xl mt-4 leading-relaxed">
            Telah berhasil menyelesaikan dan lulus dengan kualifikasi sangat memuaskan pada program pelatihan praktikum virtual:
          </p>
          
          <h3 className="text-xl font-bold text-blue-800 mt-4 bg-blue-50 px-6 py-2 rounded-full border border-blue-100">
            Dasar Routing IPv4 (MikroTik RouterOS)
          </h3>
          
          <div className="mt-16 w-full flex justify-between items-end px-12">
            <div className="text-center">
              <div className="border-b border-slate-400 w-48 mb-2"></div>
              <p className="text-sm font-bold text-slate-700">Instruktur Utama</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 font-mono mb-2">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <div className="border-b border-slate-400 w-48 mb-2">
                <p className="text-sm text-slate-800 pb-1">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <p className="text-sm font-bold text-slate-700">Tanggal Terbit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
