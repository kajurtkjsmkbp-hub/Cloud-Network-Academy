"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// xterm di-import secara dinamis untuk menghindari SSR error
import "xterm/css/xterm.css";
import { 
  Terminal as TerminalIcon, ChevronRight, Server, BookOpen, Star, CheckCircle, Code, HelpCircle
} from "lucide-react";
import { mikrotikModules, ModuleData, QuizQuestion, LabTask } from "@/data/modules";

// Perlu diwrap Suspense karena pakai useSearchParams
function LabContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modulId = searchParams.get("modul") || "modul1";
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<any>(null);
  const commandBuffer = useRef<string>("");
  
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);
  
  // States: 'materi' -> 'quiz' -> 'lab' -> 'finished'
  const [stage, setStage] = useState<'materi' | 'quiz' | 'lab' | 'finished'>('materi');
  const [modulData, setModulData] = useState<ModuleData | null>(null);
  
  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{correct: boolean, msg: string} | null>(null);

  // Lab state
  const [currentLabIdx, setCurrentLabIdx] = useState(0);

  const [alert, setAlert] = useState<{show: boolean, msg: string, type: 'success' | 'info'}>({show: false, msg: '', type: 'success'});

  useEffect(() => {
    const currentUserStr = localStorage.getItem("lms_currentUser");
    if (!currentUserStr) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(currentUserStr);
    setUser(parsed);
    setPoints(parsed.points || 0);

    const data = mikrotikModules.find(m => m.id === modulId);
    if (data) setModulData(data);
  }, [router, modulId]);

  const savePointsAndProgress = (newPoints: number, isFinished: boolean = false) => {
    if (!user) return;
    let totalPoints = (user.points || 0) + newPoints;
    setPoints(totalPoints);
    
    const updatedUser = { ...user, points: totalPoints };
    
    if (isFinished) {
      if (!updatedUser.completedModules) updatedUser.completedModules = [];
      if (!updatedUser.completedModules.includes(modulId)) {
        updatedUser.completedModules.push(modulId);
      }
    }
    
    localStorage.setItem("lms_currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    const users = JSON.parse(localStorage.getItem("lms_users") || "[]");
    const index = users.findIndex((u: any) => u.email === updatedUser.email);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem("lms_users", JSON.stringify(users));
    }
  };

  const showAlert = (msg: string, type: 'success' | 'info' = 'success') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: 'success' }), 3000);
  };

  // ----- QUIZ LOGIC -----
  const submitQuiz = () => {
    if (selectedAnswer === null || !modulData) return;
    
    const currentQuiz = modulData.quizzes[currentQuizIdx];
    if (selectedAnswer === currentQuiz.correctAnswer) {
      setQuizFeedback({ correct: true, msg: "Tepat sekali! +5 Poin" });
      savePointsAndProgress(5);
    } else {
      setQuizFeedback({ correct: false, msg: "Jawaban salah. Tidak ada poin." });
    }

    setTimeout(() => {
      setQuizFeedback(null);
      setSelectedAnswer(null);
      if (currentQuizIdx + 1 < modulData.quizzes.length) {
        setCurrentQuizIdx(prev => prev + 1);
      } else {
        setStage('lab');
      }
    }, 2000);
  };

  // ----- LAB LOGIC -----
  const checkLabCommand = (cmd: string) => {
    if (stage !== 'lab' || !modulData) return false;
    
    const cleanCmd = cmd.trim().toLowerCase();
    const currentTask = modulData.labTasks[currentLabIdx];
    
    // Check if command is in expected commands (ignoring extra spaces)
    const isCorrect = currentTask.expectedCommands.some(expected => {
      // Basic regex or direct match for flexibility
      return cleanCmd === expected.toLowerCase() || cleanCmd.replace(/\s+/g, ' ') === expected.toLowerCase();
    });

    if (isCorrect) {
      if (currentTask.mockOutput) {
        termInstance.current?.writeln(currentTask.mockOutput);
      }
      termInstance.current?.write("\r\n\x1b[1;32m[admin@MikroTik]\x1b[0m > ");
      
      showAlert(`${currentTask.successMessage} (+${currentTask.points} Poin)`, "success");
      
      const isFinished = (currentLabIdx + 1) >= modulData.labTasks.length;
      savePointsAndProgress(currentTask.points, isFinished);
      
      if (isFinished) {
        setStage('finished');
      } else {
        setCurrentLabIdx(prev => prev + 1);
      }
      return true;
    }
    
    if (cleanCmd !== "") {
      termInstance.current?.writeln(`\r\nbad command name ${cleanCmd} (line 1 column 1)`);
      termInstance.current?.write("\x1b[1;32m[admin@MikroTik]\x1b[0m > ");
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (stage !== 'lab' || !terminalRef.current || termInstance.current) return;

    // Dynamic import to avoid SSR 'self is not defined'
    import('xterm').then(({ Terminal }) => {
      import('xterm-addon-fit').then(({ FitAddon }) => {
        const term = new Terminal({
          theme: { background: "#020617", foreground: "#e2e8f0", cursor: "#3b82f6" },
          cursorBlink: true,
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontSize: 15,
        });
        
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        termInstance.current = term;
        
        setTimeout(() => fitAddon.fit(), 100);

        term.writeln("\x1b[1;36m[System]\x1b[0m Booting up virtual environment...");
        term.writeln("\x1b[1;32m[Success]\x1b[0m Connected to MikroTik RouterOS.");
        term.writeln("");
        term.write("\x1b[1;32m[admin@MikroTik]\x1b[0m > ");

        term.onData((data: string) => {
          const code = data.charCodeAt(0);
          if (code === 13) { // Enter
            const executed = checkLabCommand(commandBuffer.current);
            if (!executed) {
              term.write("\r\n\x1b[1;32m[admin@MikroTik]\x1b[0m > ");
            }
            commandBuffer.current = "";
          } else if (code === 127) { // Backspace
            if (commandBuffer.current.length > 0) {
              commandBuffer.current = commandBuffer.current.slice(0, -1);
              term.write("\b \b");
            }
          } else {
            commandBuffer.current += data;
            term.write(data);
          }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        // cleanup for dynamic import is handled in standard useEffect cleanup (but we can't easily access term from outside the promise)
        // for this mock, we just let it be or store dispose in ref.
        termInstance.current.disposeFn = () => {
          window.removeEventListener("resize", handleResize);
          term.dispose();
        };
      });
    });

    return () => {
      if (termInstance.current && termInstance.current.disposeFn) {
        termInstance.current.disposeFn();
      }
      termInstance.current = null;
    };
  }, [stage, currentLabIdx, modulData]); 

  if (!modulData) return <div className="p-8 text-white">Memuat modul...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
            <Server size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">CloudNetwork <span className="text-blue-400">Academy</span></h1>
            <p className="text-xs text-slate-500 font-medium">{modulData.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <span className="text-amber-500 font-bold">{points} Poin</span>
          </div>
          <button 
            onClick={() => router.push("/dashboard/student")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2 rounded-lg font-medium transition-all"
          >
            Tutup Modul
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 gap-4 relative">
        {alert.show && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold animate-bounce">
            <CheckCircle size={20} />
            {alert.msg}
          </div>
        )}

        {/* Panel Kiri (Konten) */}
        <div className={`transition-all duration-500 ${stage === 'materi' ? 'w-1/2 max-w-2xl' : 'w-1/3 max-w-md'} bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl relative`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className={`p-8 overflow-y-auto flex-1 prose prose-invert max-w-none ${stage === 'materi' ? 'prose-lg' : 'prose-sm'}`}>
            
            {/* STAGE: MATERI */}
            {stage === 'materi' && (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="text-blue-400"/> Materi Pembelajaran</h2>
                <div dangerouslySetInnerHTML={{__html: modulData.materiHtml}} />
              </>
            )}

            {/* STAGE: QUIZ */}
            {stage === 'quiz' && modulData.quizzes.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><HelpCircle className="text-amber-400"/> Kuis Pilihan Ganda</h2>
                <div className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Soal {currentQuizIdx + 1} dari {modulData.quizzes.length}
                </div>
                
                <p className="text-lg font-medium text-slate-200 mb-6 leading-relaxed">
                  {modulData.quizzes[currentQuizIdx].question}
                </p>

                <div className="space-y-3">
                  {modulData.quizzes[currentQuizIdx].options.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      disabled={quizFeedback !== null}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${selectedAnswer === idx ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 hover:border-slate-500'} ${quizFeedback && modulData.quizzes[currentQuizIdx].correctAnswer === idx ? 'bg-emerald-600/20 border-emerald-500' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className={`mt-6 p-4 rounded-lg text-center font-bold ${quizFeedback.correct ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50' : 'bg-rose-900/50 text-rose-400 border border-rose-500/50'}`}>
                    {quizFeedback.msg}
                  </div>
                )}
              </>
            )}

            {/* STAGE: LAB */}
            {stage === 'lab' && modulData.labTasks.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Code className="text-blue-400"/> Tugas Mandiri (Praktek)</h2>
                
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tugas {currentLabIdx + 1} dari {modulData.labTasks.length}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${modulData.labTasks[currentLabIdx].difficulty === 'Mudah' ? 'bg-green-900/50 text-green-400' : modulData.labTasks[currentLabIdx].difficulty === 'Sedang' ? 'bg-blue-900/50 text-blue-400' : modulData.labTasks[currentLabIdx].difficulty === 'Susah' ? 'bg-orange-900/50 text-orange-400' : 'bg-rose-900/50 text-rose-400'}`}>
                    {modulData.labTasks[currentLabIdx].difficulty}
                  </span>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {modulData.labTasks[currentLabIdx].instruction}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-amber-400 font-bold mb-1">HADIAH PENYELESAIAN</p>
                    <p className="text-2xl font-black text-amber-500">+{modulData.labTasks[currentLabIdx].points} Poin</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-6 text-center italic">
                  Ketikkan perintah Anda di terminal hitam sebelah kanan.
                </p>
              </>
            )}

            {/* STAGE: FINISHED */}
            {stage === 'finished' && (
              <div className="flex flex-col items-center justify-center text-center h-full pt-10">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Modul Selesai!</h2>
                <p className="text-slate-400">Selamat! Anda telah menyelesaikan seluruh materi, kuis, dan praktek pada modul ini.</p>
                <p className="text-amber-400 mt-4 font-bold">Total Poin Anda: {points}</p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
            {stage === 'materi' && (
               <button onClick={() => setStage(modulData.quizzes.length > 0 ? 'quiz' : 'lab')} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                 Lanjut ke Kuis <ChevronRight size={18}/>
               </button>
            )}
            
            {stage === 'quiz' && (
               <button 
                onClick={submitQuiz} 
                disabled={selectedAnswer === null || quizFeedback !== null}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all"
               >
                 Jawab
               </button>
            )}

            {stage === 'finished' && (
               <button onClick={() => router.push("/dashboard/student")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold">
                 Kembali ke Dashboard
               </button>
            )}
          </div>
        </div>

        {/* Panel Kanan (Terminal) - Hanya aktif saat Lab */}
        <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative transition-opacity duration-500 ${stage === 'lab' ? 'opacity-100' : 'opacity-30 pointer-events-none filter blur-sm'}`}>
          <div className="bg-slate-950/80 px-4 py-3 flex items-center gap-3 border-b border-slate-800">
            <TerminalIcon size={14} className="text-slate-500" />
            <span className="font-mono text-xs text-slate-400">root@hq-router-01:~ (Interactive Grading Enabled)</span>
          </div>
          <div className="flex-1 p-2 bg-[#020617] relative">
            <div className="w-full h-full relative z-10" ref={terminalRef}></div>
            {stage !== 'lab' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <p className="bg-slate-900/80 px-6 py-3 rounded-full text-slate-300 font-medium">
                  Terminal akan aktif saat Anda mencapai tahap Praktek.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white text-center">Memuat Lab...</div>}>
      <LabContent />
    </Suspense>
  );
}
