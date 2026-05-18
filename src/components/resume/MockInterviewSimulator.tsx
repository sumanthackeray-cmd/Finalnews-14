import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Star, Loader2, Send, Mic, MicOff, CheckCircle2, 
  AlertCircle, Award, TrendingUp, ThumbsUp, ArrowRight, RotateCcw, 
  X, ChevronRight, ChevronLeft, BookOpen, User, Briefcase, 
  HelpCircle, MessageSquare, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { generateAIContent } from "@/lib/ai-service";
import type { ResumeData } from "@/lib/resume-types";
import logo from "@/assets/logo.png";

interface MockInterviewSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  user: any;
}

interface InterviewQuestion {
  type: string;
  question: string;
  tip: string;
}

interface QAItem {
  question: string;
  type: string;
  answer: string;
}

interface PerformanceReport {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  starScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  evaluations: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
    modelAnswer: string;
  }[];
}

export function MockInterviewSimulator({ isOpen, onClose, resumeData, user }: MockInterviewSimulatorProps) {
  const [stage, setStage] = useState<"welcome" | "interviewing" | "assessing" | "report">("welcome");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  
  // Custom interactive animations and timers
  const [typedQuestion, setTypedQuestion] = useState("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 mins per question
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Stop recognition on unmount/close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Accordion toggle index for the final detailed performance audit
  const [expandedEvalIdx, setExpandedEvalIdx] = useState<number | null>(0);

  const candidateName = resumeData.basics.name || "Candidate";
  const candidateTitle = resumeData.basics.title || "Full Stack Developer";
  
  // Simulated Voice Waveform Visualizer
  const [voiceWaves, setVoiceWaves] = useState<number[]>([15, 25, 10, 30, 45, 15, 20, 35, 10, 25]);

  useEffect(() => {
    let waveInterval: NodeJS.Timeout;
    if (isRecording) {
      waveInterval = setInterval(() => {
        setVoiceWaves(Array.from({ length: 15 }, () => Math.floor(Math.random() * 55) + 5));
      }, 100);
    }
    return () => clearInterval(waveInterval);
  }, [isRecording]);

  // Handle Question Typing Effect (Robust double-call/HMR safe typing)
  useEffect(() => {
    if (stage === "interviewing" && questions[currentIdx]) {
      setTypedQuestion("");
      const fullText = questions[currentIdx].question;
      let currentString = "";
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < fullText.length) {
          currentString += fullText.charAt(index);
          setTypedQuestion(currentString);
          index++;
        } else {
          clearInterval(timer);
        }
      }, 15);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [stage, currentIdx, questions]);

  // Question countdown timer
  useEffect(() => {
    if (stage === "interviewing") {
      setTimeRemaining(300);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, currentIdx]);

  // Auto-transition analysis steps during loading report
  useEffect(() => {
    let stepsInterval: NodeJS.Timeout;
    if (stage === "assessing") {
      setAnalysisStep(0);
      stepsInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(stepsInterval);
  }, [stage]);

  if (!isOpen) return null;

  // Initialize and load custom tailored interview questions
  const startInterview = async () => {
    setLoadingQuestions(true);
    try {
      const res = await generateAIContent({
        action: "interview-questions",
        data: {
          name: candidateName,
          title: candidateTitle,
          experience: resumeData.experience,
          skills: resumeData.skills,
        },
      });
      
      if (res?.error) throw new Error(res.error);
      
      const loadedQuestions = res.questions || [];
      if (loadedQuestions.length === 0) {
        throw new Error("No questions were returned. Please try again.");
      }
      
      setQuestions(loadedQuestions);
      setCurrentIdx(0);
      setUserAnswers({});
      setCurrentAnswer("");
      setStage("interviewing");
    } catch (e: any) {
      toast.error(e.message || "Failed to initialize interview coach.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Skip or navigate back/forward
  const handleNextQuestion = () => {
    setUserAnswers(prev => ({ ...prev, [currentIdx]: currentAnswer }));
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCurrentAnswer(userAnswers[currentIdx + 1] || "");
      setShowTip(true);
    } else {
      submitForAssessment();
    }
  };

  const handlePrevQuestion = () => {
    setUserAnswers(prev => ({ ...prev, [currentIdx]: currentAnswer }));
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setCurrentAnswer(userAnswers[currentIdx - 1] || "");
      setShowTip(true);
    }
  };

  // Real speech-to-text using standard Web Speech API
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("🎙️ Voice transcription is not supported by your browser. Please use Chrome or Edge.");
      return;
    }

    if (!isRecording) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false; // We only want solid finalized transcript inputs
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecording(true);
          toast.info("🎙️ Mic listening active... Speak now!");
        };

        rec.onresult = (event: any) => {
          let transcriptChunk = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcriptChunk += event.results[i][0].transcript;
            }
          }
          if (transcriptChunk) {
            setCurrentAnswer((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? cleanedPrev + " " + transcriptChunk.trim() : transcriptChunk.trim();
            });
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error("🎙️ Mic access denied. Please grant microphone permissions.");
          } else {
            toast.error("🎙️ Voice error: " + event.error);
          }
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err: any) {
        console.error("Speech recognition start failed:", err);
        toast.error("Failed to initialize speech recognition.");
        setIsRecording(false);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      toast.success("🎤 Voice listening completed!");
    }
  };

  // Compile final mock interview Q&As and fetch comprehensive report
  const submitForAssessment = async () => {
    const finalAnswers = { ...userAnswers, [currentIdx]: currentAnswer };
    setUserAnswers(finalAnswers);
    
    const answeredCount = Object.values(finalAnswers).filter(a => a.trim().length > 10).length;
    if (answeredCount === 0) {
      toast.warning("Please provide a solid response to at least one question before ending.");
      return;
    }
    
    setStage("assessing");
    setLoadingReport(true);
    
    try {
      const qaList = questions.map((q, i) => ({
        question: q.question,
        type: q.type,
        answer: finalAnswers[i] || "[No Answer Provided]"
      }));
      
      const res = await generateAIContent({
        action: "evaluate-interview",
        data: {
          name: candidateName,
          title: candidateTitle,
          qaList: qaList
        }
      });
      
      if (res?.error) throw new Error(res.error);
      
      setReport(res);
      setStage("report");
      setExpandedEvalIdx(0); // open first accordion question by default
    } catch (e: any) {
      toast.error(e.message || "Failed to compile your performance report.");
      setStage("interviewing");
    } finally {
      setLoadingReport(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
    if (score >= 60) return "text-amber-505 border-amber-505 bg-amber-505/10 dark:text-amber-500 dark:border-amber-500 dark:bg-amber-500/10";
    return "text-rose-500 border-rose-500 bg-rose-500/10";
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-slate-50/98 dark:bg-slate-950/98 text-slate-800 dark:text-slate-100 overflow-hidden backdrop-blur-md animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <header className="h-10 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none">
        
        {/* Left Side: Brand Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative flex-shrink-0">
            <img
              src={logo}
              alt="Vogats AI Logo"
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm sm:rounded-md object-cover shadow-sm"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[11px] sm:text-xs font-black tracking-tight leading-none bg-gradient-to-r from-purple-650 to-indigo-500 dark:from-purple-400 dark:to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
              Vogats AI Mock Interview
            </h2>
            <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 whitespace-nowrap">
              Tailored for: {candidateTitle}
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {stage === "interviewing" && (
            <>
              {/* Live Simulator Pill - Hidden on ultra-narrow mobile but responsive */}
              <div className="hidden xs:flex items-center gap-1 bg-slate-200 dark:bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-650 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
              
              {/* Snug timer box */}
              <div className="text-[10px] sm:text-[11px] font-bold font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-750 dark:text-slate-200">
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </>
          )}

          {/* Close modal X button */}
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center"
            style={{ width: "24px", height: "24px" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        
        {/* STAGE 1: WELCOME SCREEN */}
        {stage === "welcome" && (
          <div className="space-y-6 my-auto text-center max-w-lg mx-auto py-8 px-2 animate-in fade-in duration-500">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/5 dark:from-purple-500/25 dark:to-indigo-500/5 border border-purple-500/20 dark:border-purple-500/30 shadow-xl shadow-purple-500/5 animate-bounce-slow">
              <Award className="w-10 h-10 md:w-12 md:h-12 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Ready for a Real-world <span className="bg-gradient-to-r from-purple-650 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Full Stack</span> Interview?
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                We've analyzed your resume for <span className="text-slate-900 dark:text-slate-200 font-bold">{candidateName}</span>. 
                Our AI will conduct a realistic mock tech and behavioral interview customized exactly to your career story.
              </p>
            </div>

            {/* Resume Info pill */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-650 dark:text-slate-400">Resume Data Analyzed Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] mb-0.5 uppercase font-bold tracking-wider">Target Role</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">{candidateTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] mb-0.5 uppercase font-bold tracking-wider">Experience Found</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block">{resumeData.experience?.length || 0} Roles Added</span>
                </div>
              </div>
            </div>

            {/* Instruction Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30 flex items-start gap-2.5 shadow-sm">
                <HelpCircle className="w-4 h-4 text-purple-650 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Tailored Qs</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Behavioral, technical & situational.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30 flex items-start gap-2.5 shadow-sm">
                <Mic className="w-4 h-4 text-indigo-650 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Voice / Text</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Type or speak your answer interactively.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30 flex items-start gap-2.5 shadow-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Full Scoring</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Instant metrics and 1% model answers.</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={startInterview} 
              disabled={loadingQuestions}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-purple-600/10 dark:shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden"
            >
              {loadingQuestions ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Resume & Building Qs...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Start Live Interview Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        )}

        {/* STAGE 2: INTERVIEWING SIMULATOR */}
        {stage === "interviewing" && questions[currentIdx] && (
          <div className="space-y-5 py-2 my-auto px-1 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Status bar */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider text-[9px]">
                {questions[currentIdx].type} Question
              </span>
              <span className="text-slate-550 dark:text-slate-400">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Screen */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500" />
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                  AI
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Interviewer</h3>
                  <p className="text-[14px] sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed min-h-[50px]">
                    {typedQuestion || "..."}
                  </p>
                </div>
              </div>

              {/* Expert Coach Tip Alert */}
              {showTip && (
                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-955/30 border border-indigo-105 dark:border-indigo-900/50 p-3 sm:p-3.5 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Coach Preparation Tip</span>
                      <button onClick={() => setShowTip(false)} className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350">Hide</button>
                    </div>
                    <p className="text-[11px] text-slate-650 dark:text-slate-300 italic leading-relaxed">
                      "{questions[currentIdx].tip}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Answer Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-605 dark:text-slate-350">Your Response</span>
                <button 
                  onClick={() => setIsVoiceMode(!isVoiceMode)} 
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border shadow-sm ${isVoiceMode ? 'bg-purple-600/10 text-purple-600 border-purple-500/40 dark:text-purple-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-805 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  {isVoiceMode ? (
                    <><Mic className="w-3 h-3 text-purple-650 dark:text-purple-400" /> Voice Input Active</>
                  ) : (
                    <><MessageSquare className="w-3 h-3 text-purple-655 dark:text-purple-450" /> Switch to Voice Mode</>
                  )}
                </button>
              </div>

              {/* Answer input area */}
              {isVoiceMode ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[160px] relative overflow-hidden shadow-sm">
                  
                  {isRecording ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                        {voiceWaves.map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${h}px` }} 
                            className="w-1 bg-gradient-to-t from-purple-600 to-pink-505 rounded-full transition-all duration-100" 
                          />
                        ))}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Listening...</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">AI is converting your speech to text in real-time.</p>
                      </div>
                      <Button onClick={toggleRecording} variant="destructive" size="sm" className="rounded-full h-9 px-4">
                        <MicOff className="w-3.5 h-3.5 mr-1.5" /> Stop Speaking
                      </Button>
                    </>
                  ) : (
                    <>
                      <div 
                        onClick={toggleRecording}
                        className="cursor-pointer flex items-center justify-center w-14 h-14 rounded-full bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/30 dark:border-purple-500/40 text-purple-650 dark:text-purple-400 hover:bg-purple-600/20 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-600/5 animate-pulse"
                      >
                        <Mic className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-205">Tap to start speaking</p>
                        <p className="text-[10px] text-slate-500">Perfect for hands-free mock practice. Converts voice immediately to the textbox below.</p>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              <Textarea
                rows={isVoiceMode ? 3 : 5}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Structure your answer clearly. Try to provide context, details of your actual tasks, and quantified metrics if possible (e.g. STAR/CAR method)..."
                className="text-sm bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 focus-visible:ring-purple-500 text-slate-900 dark:text-slate-100 rounded-xl p-4 leading-relaxed shadow-sm"
              />
            </div>

            {/* ACTION NAV BAR */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-850 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevQuestion}
                disabled={currentIdx === 0}
                className="h-10 text-xs border-slate-250 hover:bg-slate-100 text-slate-750 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" /> Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="h-10 text-xs text-slate-550 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-205"
                >
                  Skip Question
                </Button>

                <Button
                  size="sm"
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer.trim()}
                  className="h-10 px-4 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
                >
                  {currentIdx === questions.length - 1 ? (
                    <div className="flex items-center gap-1.5">
                      <span>Submit Mock Interview</span>
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Submit & Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: COMPILING PERFORMANCE REPORT SCREEN */}
        {stage === "assessing" && (
          <div className="space-y-6 py-12 text-center max-w-sm mx-auto my-auto animate-in fade-in duration-305">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-xl animate-pulse" />
              <Loader2 className="w-16 h-16 text-purple-650 dark:text-purple-500 animate-spin relative" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Analyzing Your Answers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Please wait while our senior tech recruiter AI reviews your mock interview transcript, calculates scores, and compiles feedback.
              </p>
            </div>

            {/* Dynamic steps tracker */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 space-y-3 text-left shadow-sm">
              {[
                "Aggregating interview transcript...",
                "Running grammar and communication check...",
                "Checking technical accuracy vs industry benchmarks...",
                "Drafting perfect 1% candidate model answers..."
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {analysisStep > idx ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : analysisStep === idx ? (
                    <Loader2 className="w-4 h-4 text-purple-550 dark:text-purple-400 shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-800 shrink-0" />
                  )}
                  <span className={analysisStep > idx ? "text-slate-700 dark:text-slate-300" : analysisStep === idx ? "text-purple-600 dark:text-purple-400 font-bold" : "text-slate-400 dark:text-slate-600"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 italic">
              "STAR Method: Structure answers with Situation, Task, Action, and measurable Results."
            </p>
          </div>
        )}

        {/* STAGE 4: COMPREHENSIVE PERFORMANCE REPORT */}
        {stage === "report" && report && (
          <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Success Heading */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-555 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">Interview Practice Completed!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Excellent effort! Here is your tailored AI performance audit and scorecard.</p>
            </div>

            {/* Scorecard Hero Banner */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-5 md:p-6 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center shadow-md">
              
              {/* Radial Circular Gauge */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(report.overallScore)} shadow-md`}>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{report.overallScore}%</span>
                  <span className="text-[9px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-bold mt-0.5">Overall Score</span>
                </div>
              </div>

              {/* Score breakdown metrics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-205 dark:border-slate-800 pb-1.5">Competency Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Technical Competence", score: report.technicalScore, max: 10, color: "bg-purple-550 dark:bg-purple-500" },
                    { label: "Communication & Clarity", score: report.communicationScore, max: 10, color: "bg-indigo-550 dark:bg-indigo-500" },
                    { label: "STAR Structure Quality", score: report.starScore, max: 10, color: "bg-pink-550 dark:bg-pink-500" }
                  ].map((metric, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-650 dark:text-slate-350">{metric.label}</span>
                        <span className="text-slate-850 dark:text-slate-205">{metric.score} / {metric.max}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`${metric.color} h-full rounded-full transition-all duration-1000`} 
                          style={{ width: `${(metric.score / metric.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment summary box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-4 space-y-2 shadow-sm">
              <h3 className="text-[9px] font-bold text-purple-650 dark:text-purple-400 uppercase tracking-wider">Coach Synthesis</h3>
              <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed italic">
                "{report.summary}"
              </p>
            </div>

            {/* Strengths & Improvements grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Strengths Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 border-b border-slate-100 dark:border-slate-850 pb-2 text-xs font-bold uppercase tracking-wider">
                  <ThumbsUp className="w-4 h-4 text-emerald-555 shrink-0 animate-pulse" />
                  <span>Key Strengths</span>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  {report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 border-b border-slate-100 dark:border-slate-850 pb-2 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-505 shrink-0" />
                  <span>Areas of Improvement</span>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
                  {report.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-505 mt-1.5 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Expandable Q&A Detailed Audit Accordion (Clean & Compact on Mobile!) */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Detailed Question Review & Model Answers</h3>
              <div className="space-y-3">
                {report.evaluations.map((evalItem, idx) => {
                  const isExpanded = expandedEvalIdx === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 overflow-hidden shadow-sm transition-all duration-300">
                      
                      {/* Header (clickable toggle) */}
                      <div 
                        onClick={() => setExpandedEvalIdx(isExpanded ? null : idx)}
                        className="flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900/80 dark:hover:bg-slate-900/90 border-b border-slate-200 dark:border-slate-855 text-xs cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-200">Question {idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getScoreColor(evalItem.score)}`}>
                            {evalItem.score}% Score
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-purple-500' : ''}`} />
                      </div>

                      {/* Expandable Area */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 text-xs animate-in fade-in slide-in-from-top-3 duration-300">
                          
                          {/* Question */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Question Asked</span>
                            <p className="text-slate-850 dark:text-slate-100 font-bold leading-relaxed">{evalItem.question}</p>
                          </div>

                          {/* Answer */}
                          <div className="space-y-1 bg-slate-50 dark:bg-slate-955/40 p-3 rounded-lg border border-slate-150 dark:border-slate-900">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Your Response</span>
                            <p className="text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{evalItem.answer}</p>
                          </div>

                          {/* Feedback */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-bold">AI Critique & Action Plan</span>
                            <p className="text-slate-705 dark:text-slate-300 leading-relaxed">{evalItem.feedback}</p>
                          </div>

                          {/* Model Answer */}
                          <div className="space-y-1 bg-purple-50/50 dark:bg-purple-955/15 p-3.5 rounded-lg border border-purple-100 dark:border-purple-900/20 shadow-sm relative overflow-hidden animate-pulse-subtle">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500" />
                            <span className="text-[9px] text-purple-700 dark:text-purple-300 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" /> Elite 1% Model Answer
                            </span>
                            <p className="text-slate-800 dark:text-slate-205 leading-relaxed mt-1.5 italic whitespace-pre-wrap">
                              "{evalItem.modelAnswer}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUTTON BAR */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-900 shrink-0">
              <Button 
                onClick={startInterview} 
                variant="outline" 
                className="flex-1 h-11 text-xs border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Start Another Practice Run
              </Button>
              <Button 
                onClick={onClose} 
                className="flex-1 h-11 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md"
              >
                Done, Back to Resume Editor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
