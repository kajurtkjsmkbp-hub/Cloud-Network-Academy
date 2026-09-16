"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Users, Star, TrendingUp, CheckCircle, Award, Settings, Trash2, ShieldBan, ShieldCheck, Edit, Plus, UserPlus, Printer } from "lucide-react";
import { mikrotikModules } from "@/data/modules";

export default function TeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  
  const [editModal, setEditModal] = useState<{isOpen: boolean, email: string, newName: string, newPassword: string}>({isOpen: false, email: "", newName: "", newPassword: ""});
  const [addTeacherModal, setAddTeacherModal] = useState({isOpen: false, fullName: "", email: "", password: ""});
  
  const [studentToPrint, setStudentToPrint] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [router]);

  useEffect(() => {
    if (studentToPrint) {
      // Need a small timeout to let the print view render before calling print
      const timer = setTimeout(() => {
        window.print();
        setStudentToPrint(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [studentToPrint]);

  const loadData = () => {
    const currentUserStr = localStorage.getItem("lms_currentUser");
    if (currentUserStr) {
      const parsed = JSON.parse(currentUserStr);
      if (parsed.role !== "teacher") {
        router.push("/dashboard/student");
      } else {
        setUserEmail(parsed.email);
        
        const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
        setStudentsList(allUsers.filter((u: any) => u.role === "student"));
        setTeachersList(allUsers.filter((u: any) => u.role === "teacher"));
      }
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lms_currentUser");
    router.push("/login");
  };

  const updateUsers = (newUsers: any[]) => {
    localStorage.setItem("lms_users", JSON.stringify(newUsers));
    setStudentsList(newUsers.filter((u: any) => u.role === "student"));
    setTeachersList(newUsers.filter((u: any) => u.role === "teacher"));
  };

  const handleDelete = (email: string) => {
    if (email === userEmail) {
      alert("Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif digunakan.");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${email}? Data tidak dapat dikembalikan.`)) {
      const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
      const newUsers = allUsers.filter((u: any) => u.email !== email);
      updateUsers(newUsers);
    }
  };

  const handleToggleSuspend = (email: string, currentStatus: string) => {
    if (email === userEmail) {
      alert("Anda tidak bisa menonaktifkan akun Anda sendiri.");
      return;
    }
    const isSuspended = currentStatus === "suspended";
    const actionText = isSuspended ? "mengaktifkan kembali" : "menonaktifkan sementara";
    
    if (confirm(`Apakah Anda yakin ingin ${actionText} akun ${email}?`)) {
      const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
      const newUsers = allUsers.map((u: any) => 
        u.email === email ? { ...u, status: isSuspended ? "active" : "suspended" } : u
      );
      updateUsers(newUsers);
    }
  };

  const openEditModal = (user: any) => {
    setEditModal({
      isOpen: true,
      email: user.email,
      newName: user.fullName || user.email.split("@")[0],
      newPassword: user.password || ""
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
    const newUsers = allUsers.map((u: any) => 
      u.email === editModal.email ? { ...u, fullName: editModal.newName, password: editModal.newPassword } : u
    );
    updateUsers(newUsers);
    setEditModal({ ...editModal, isOpen: false });
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = JSON.parse(localStorage.getItem("lms_users") || "[]");
    
    if (allUsers.find((u: any) => u.email === addTeacherModal.email)) {
      alert("Email sudah digunakan.");
      return;
    }
    
    const newTeacher = {
      email: addTeacherModal.email,
      password: addTeacherModal.password,
      role: "teacher",
      fullName: addTeacherModal.fullName,
      status: "active"
    };
    
    const newUsers = [...allUsers, newTeacher];
    updateUsers(newUsers);
    setAddTeacherModal({isOpen: false, fullName: "", email: "", password: ""});
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 print:bg-white">
      
      {/* --- PRINT VIEW (Hanya terlihat saat diprint) --- */}
      {studentToPrint && (
        <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black">
          <div className="text-center mb-8 border-b-2 border-slate-300 pb-4">
            <h1 className="text-3xl font-bold mb-2 uppercase">Laporan Progres Belajar Siswa</h1>
            <h2 className="text-xl font-medium text-slate-700">CloudNetwork Virtual Lab - MikroTik Edition</h2>
          </div>
          
          <div className="mb-8">
            <h3 className="font-bold text-lg border-b border-slate-200 mb-2">Informasi Siswa</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="font-semibold w-32 inline-block">Nama Lengkap</span>: {studentToPrint.fullName || studentToPrint.email.split("@")[0]}</p>
              <p><span className="font-semibold w-32 inline-block">Status Akun</span>: {studentToPrint.status === 'suspended' ? 'Dinonaktifkan' : 'Aktif'}</p>
              <p><span className="font-semibold w-32 inline-block">Email</span>: {studentToPrint.email}</p>
              <p><span className="font-semibold w-32 inline-block">Total Poin</span>: {studentToPrint.points || 0} Poin</p>
              <p><span className="font-semibold w-32 inline-block">Modul Selesai</span>: {(studentToPrint.completedModules || []).length} / {mikrotikModules.length}</p>
            </div>
          </div>

          <h3 className="font-bold text-lg border-b border-slate-200 mb-4">Rekam Jejak Kuis (Semua Modul)</h3>
          
          {studentToPrint.quizHistory && studentToPrint.quizHistory.length > 0 ? (
            <div className="space-y-6">
              {studentToPrint.quizHistory.map((q: any, i: number) => (
                <div key={i} className="border border-slate-200 p-4 rounded-lg bg-slate-50 page-break-inside-avoid">
                  <p className="font-bold text-sm text-slate-500 mb-1">{q.modulTitle} - Soal {q.questionIdx + 1}</p>
                  <p className="font-medium text-slate-800 mb-3">{q.questionText}</p>
                  
                  <div className="pl-4 border-l-2 border-slate-300">
                    <p className="text-sm">
                      <span className="font-semibold">Jawaban Siswa:</span>{' '}
                      <span className={q.isCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                        {q.selectedOption}
                      </span>
                    </p>
                    
                    {!q.isCorrect && (
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Kunci Jawaban (Benar):</span>{' '}
                        <span className="text-emerald-700 font-bold">{q.correctOption}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className={`mt-3 px-3 py-1.5 inline-block rounded text-xs font-bold ${q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    Hasil: {q.isCorrect ? "BENAR (+5 Poin)" : "SALAH (0 Poin)"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-lg text-slate-500 mb-8">
              Siswa ini belum mengerjakan kuis apa pun yang terekam di sistem.
            </div>
          )}

          <h3 className="font-bold text-lg border-b border-slate-200 mb-4 mt-8">Rekam Jejak Lab (Perintah Terminal)</h3>
          
          {studentToPrint.labHistory && studentToPrint.labHistory.length > 0 ? (
            <div className="space-y-4">
              {studentToPrint.labHistory.map((l: any, i: number) => (
                <div key={i} className="border border-slate-200 p-3 rounded-lg bg-slate-50 page-break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-slate-500">{l.modulTitle} - Tugas {l.taskIdx + 1}</p>
                    <span className="text-xs text-slate-400">{l.time}</span>
                  </div>
                  <p className="font-medium text-sm text-slate-700 mb-2">{l.instruction}</p>
                  <div className={`font-mono text-sm p-2 rounded border-l-4 ${l.isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-rose-50 border-rose-500 text-rose-900'}`}>
                    <span className="text-slate-500 select-none">[admin@MikroTik] &gt; </span>
                    <span className="font-bold">{l.typedCommand}</span>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${l.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {l.isCorrect ? "BERHASIL (Perintah Benar)" : "GAGAL (Perintah Salah / Typo)"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-lg text-slate-500 mb-8">
              Siswa ini belum memiliki rekaman perintah terminal di sistem.
            </div>
          )}

          <div className="mt-12 text-center text-sm text-slate-500">
            <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            <p className="mt-1">Dihasilkan secara otomatis oleh sistem CloudNetwork Virtual Lab.</p>
          </div>
        </div>
      )}
      {/* --- END PRINT VIEW --- */}

      {/* Konten Halaman (Disembunyikan saat print) */}
      <div className="print:hidden">
        {/* Edit Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Data Pengguna</h3>
              <p className="text-sm text-slate-500 mb-4">{editModal.email}</p>
              <form onSubmit={saveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editModal.newName} 
                    onChange={e => setEditModal({...editModal, newName: e.target.value})} 
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
                  <input 
                    type="text" 
                    value={editModal.newPassword} 
                    onChange={e => setEditModal({...editModal, newPassword: e.target.value})} 
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setEditModal({ ...editModal, isOpen: false })} 
                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Teacher Modal */}
        {addTeacherModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Tambah Guru Baru</h3>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={addTeacherModal.fullName} 
                    onChange={e => setAddTeacherModal({...addTeacherModal, fullName: e.target.value})} 
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Misal: Budi Guru"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={addTeacherModal.email} 
                    onChange={e => setAddTeacherModal({...addTeacherModal, email: e.target.value})} 
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="guru@sekolah.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={addTeacherModal.password} 
                    onChange={e => setAddTeacherModal({...addTeacherModal, password: e.target.value})} 
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => setAddTeacherModal({ ...addTeacherModal, isOpen: false })} 
                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <UserPlus size={18} /> Tambah Guru
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
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

        <main className="max-w-7xl mx-auto p-4 md:p-6 mt-2 md:mt-4">
          
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 space-x-2">
            <button 
              onClick={() => setActiveTab("student")} 
              className={`px-4 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'student' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Data Siswa
              {activeTab === "student" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab("teacher")} 
              className={`px-4 py-3 font-semibold text-sm transition-colors relative ${activeTab === 'teacher' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Manajemen Guru
              {activeTab === "teacher" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
            </button>
          </div>

          {activeTab === "student" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Users />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Total {studentsList.length} Siswa Terdaftar</h3>
                  <p className="text-sm text-slate-500 mt-2">Pantau perkembangan dan skor siswa Anda.</p>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Laporan Pemantauan Progres Siswa</h3>
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Data Siswa</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Total Poin</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Posisi Belajar</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Progres Keseluruhan</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Status Akhir</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada siswa yang mendaftar.</td></tr>
                    ) : (
                      studentsList.map((student, idx) => {
                        const points = student.points || 0;
                        const completedModules = student.completedModules || [];
                        const completedCount = completedModules.length;
                        const totalModules = mikrotikModules.length;
                        const progressPercent = Math.round((completedCount / totalModules) * 100);
                        const remainingPercent = 100 - progressPercent;
                        const hasDownloaded = student.hasDownloadedCertificate || false;
                        const isSuspended = student.status === "suspended";
                        const displayName = student.fullName || student.email.split("@")[0];
                        
                        let currentPosition = "Belum Mulai";
                        if (completedCount === totalModules) {
                          currentPosition = "Selesai Semua Modul";
                        } else if (completedCount > 0) {
                          currentPosition = `Mengerjakan Modul ${completedCount + 1}`;
                        } else {
                          currentPosition = "Mengerjakan Modul 1";
                        }
                        
                        let finalStatus = (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <TrendingUp size={12} /> Dalam Proses
                          </span>
                        );
                        
                        if (completedCount === totalModules && hasDownloaded) {
                          finalStatus = (
                            <div className="flex flex-col items-center justify-center bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-lg p-2 border border-emerald-200 dark:border-emerald-800/50">
                              <span className="text-xs font-bold flex items-center gap-1"><Award size={14} /> Selesai 100%</span>
                              <span className="text-[10px] font-medium mt-1 text-emerald-600 dark:text-emerald-300">Sertifikat Diunduh</span>
                            </div>
                          );
                        } else if (completedCount === totalModules) {
                          finalStatus = (
                            <div className="flex flex-col items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg p-2 border border-blue-200 dark:border-blue-800/50">
                              <span className="text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Selesai 100%</span>
                              <span className="text-[10px] font-medium mt-1 text-blue-600 dark:text-blue-300">Belum Unduh</span>
                            </div>
                          );
                        }

                        return (
                          <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${isSuspended ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {displayName}
                                  {isSuspended && <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Nonaktif</span>}
                                </span>
                                <span className="text-sm text-slate-500">{student.email}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                <Star size={14} className="fill-amber-500" /> {points}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentPosition}</span>
                              {completedCount > 0 && completedCount < totalModules && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Telah lulus {completedCount} modul
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{progressPercent}% Komplet</span>
                                {remainingPercent > 0 && (
                                  <span className="text-[10px] text-slate-500">Tinggal {remainingPercent}% lagi</span>
                                )}
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {finalStatus}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => setStudentToPrint(student)}
                                  title="Export Laporan Rekam Jejak PDF"
                                  className="p-2 text-indigo-500 hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                                >
                                  <Printer size={18} />
                                </button>
                                <button 
                                  onClick={() => openEditModal(student)}
                                  title="Edit Data Siswa"
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => handleToggleSuspend(student.email, student.status)}
                                  title={isSuspended ? "Aktifkan Kembali" : "Nonaktifkan Sementara"}
                                  className={`p-2 rounded-lg transition-colors border border-transparent ${isSuspended ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                                >
                                  {isSuspended ? <ShieldCheck size={18} /> : <ShieldBan size={18} />}
                                </button>
                                <button 
                                  onClick={() => handleDelete(student.email)}
                                  title="Hapus Siswa Permanen"
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "teacher" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daftar Guru Terdaftar</h3>
                <button 
                  onClick={() => setAddTeacherModal({...addTeacherModal, isOpen: true})}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={18} /> Tambah Guru Baru
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Data Guru</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300">Status</th>
                      <th className="p-4 font-medium text-slate-600 dark:text-slate-300 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachersList.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-500">Tidak ada data guru.</td></tr>
                    ) : (
                      teachersList.map((teacher, idx) => {
                        const isSuspended = teacher.status === "suspended";
                        const displayName = teacher.fullName || teacher.email.split("@")[0];
                        const isMe = teacher.email === userEmail;

                        return (
                          <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${isSuspended ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {displayName}
                                  {isMe && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Anda</span>}
                                </span>
                                <span className="text-sm text-slate-500">{teacher.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {isSuspended ? (
                                <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                  Tidak Aktif
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                  Aktif
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => openEditModal(teacher)}
                                  title="Edit Data Guru"
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Edit size={18} />
                                </button>
                                {!isMe && (
                                  <>
                                    <button 
                                      onClick={() => handleToggleSuspend(teacher.email, teacher.status)}
                                      title={isSuspended ? "Aktifkan Kembali" : "Nonaktifkan Sementara"}
                                      className={`p-2 rounded-lg transition-colors ${isSuspended ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                                    >
                                      {isSuspended ? <ShieldCheck size={18} /> : <ShieldBan size={18} />}
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(teacher.email)}
                                      title="Hapus Guru Permanen"
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

        <footer className="mt-4 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="font-medium">CloudNetwork Virtual Lab - MikroTik Edition - <span className="font-bold text-slate-700 dark:text-slate-300">Adiningtyas Yuli Purwanto, S.Kom</span></p>
        </footer>
      </div>
    </div>
  );
}
