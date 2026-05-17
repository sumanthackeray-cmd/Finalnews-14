import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/use-auth";
import { 
  X, Send, Loader2, Trash2, Maximize2, Minimize2, 
  Plus, Mic, Sparkles, Brain, FileText, Target,
  Pencil, CheckCircle, PlusCircle, Layout, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateAIContent } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analyze" | "interview">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Vogats AI assistant. How can I help you with your resume today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Analysis State
  const [atsScore, setAtsScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsVisible(true);
    };
    window.addEventListener("open-vogats-ai", handleOpen);
    return () => window.removeEventListener("open-vogats-ai", handleOpen);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [messages, isOpen, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend, timestamp }]);
    setIsLoading(true);

    try {
      const response = await generateAIContent({
        action: "chat",
        data: { message: messageToSend }
      });

      if (response.error) throw new Error(response.error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAtsScore(0);
    try {
      // Mock analysis for UI feedback
      for (let i = 0; i <= 88; i += 2) {
        setAtsScore(i);
        await new Promise(r => setTimeout(r, 20));
      }
      setSuggestions([
        "Quantify your achievements in the Google project.",
        "Add more action verbs to your Experience section.",
        "Missing keywords: 'System Architecture', 'CI/CD'",
        "Professional summary could be more concise."
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickActions = [
    { icon: Pencil, label: "Rewrite Summary", prompt: "Can you help me rewrite my professional summary to be more impactful?" },
    { icon: CheckCircle, label: "ATS Check", prompt: "How can I optimize my resume for ATS systems?" },
    { icon: PlusCircle, label: "Add Bullets", prompt: "Give me some strong bullet points for a Software Engineer role." },
    { icon: Target, label: "Tailor to Job", prompt: "How do I tailor my resume for a specific job description?" },
  ];

  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[999999] group/trigger">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover/trigger:opacity-100 transition-all hover:scale-110 z-10"
          title="Hide AI Assistant"
        >
          <X className="w-3 h-3" />
        </button>
        
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all bg-[#6366f1] text-white flex items-center justify-center group relative border-2 border-white/20"
        >
          <Brain className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          
          {/* Pulse Rings */}
          <div className="absolute inset-0 rounded-full bg-[#6366f1] animate-ping opacity-20" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed flex flex-col bg-bg overflow-hidden z-[999999] shadow-2xl transition-all duration-300 ease-in-out",
        "inset-0 w-full h-[100dvh] rounded-none border-0 md:inset-auto md:bottom-6 md:right-6 md:w-[480px] md:h-[min(800px,85vh)] md:rounded-[2rem] md:border md:border-border",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        isFullScreen && "md:inset-4 md:w-auto md:h-auto md:max-h-none"
      )}
    >

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
      `}</style>

      {/* Header Bar */}
      <div className="h-[64px] border-b border-border bg-bg flex flex-col shrink-0 px-4 relative z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Vogats AI Logo" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-display font-black text-sm text-text leading-none">Vogats AI</h3>
              <span className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">Career Co-Pilot</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted hover:bg-surface transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center px-4 py-2 gap-2 border-b border-border bg-card">
        {[
          { id: "chat", icon: MessageSquare, label: "AI Coach" },
          { id: "analyze", icon: Target, label: "ATS Analysis" },
          { id: "interview", icon: Brain, label: "Interview Prep" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
              activeTab === tab.id 
                ? "bg-accent text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] scale-[1.02]" 
                : "text-muted hover:text-text hover:bg-surface"
            )}
          >
            <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-white" : "text-muted")} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "chat" && (
          <ScrollArea className="h-full bg-bg chat-scrollbar">
            <div className="p-4 space-y-4" ref={scrollRef}>
              {messages.length <= 1 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center mb-6 border border-accent/10">
                    <Sparkles className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                  <h4 className="font-display font-black text-lg text-text mb-2">How can I boost your career today?</h4>
                  <p className="text-[13px] text-muted max-w-[280px] mb-8 font-medium">
                    Analyze your resume, prepare for interviews, or optimize your profile instantly.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 w-full max-w-[340px]">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action.prompt)}
                        className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-accent hover:bg-accent/5 group transition-all text-left shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface group-hover:bg-white flex items-center justify-center shrink-0 border border-border">
                          <action.icon className="w-5 h-5 text-muted group-hover:text-accent" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-text group-hover:text-accent">{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col gap-1",
                      msg.role === "user" ? "items-end" : "items-start",
                      "animate-in fade-in slide-in-from-bottom-2 duration-300"
                    )}
                  >
                    <div 
                      className={cn(
                        "px-4 py-3 text-[14px] leading-relaxed shadow-sm",
                        msg.role === "user" 
                          ? "bg-accent text-white rounded-[20px_20px_4px_20px] max-w-[85%]" 
                          : "bg-card border border-border text-text rounded-[20px_20px_20px_4px] max-w-[90%]"
                      )}
                    >
                      <div className={cn(
                        "prose prose-sm max-w-none break-words",
                        msg.role === "user" ? "text-white prose-invert" : "text-text"
                      )}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted px-2 font-black uppercase tracking-widest">{msg.timestamp}</span>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex flex-col items-start gap-1">
                  <div className="bg-card border border-border px-4 py-3 rounded-[20px_20px_20px_4px] flex items-center gap-1.5 shadow-sm">
                    {[0, 1, 2].map((dot) => (
                      <div 
                        key={dot} 
                        className="w-1.5 h-1.5 bg-accent rounded-full"
                        style={{ animation: `pulseDot 1.4s infinite ease-in-out both`, animationDelay: `${dot * 0.16}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {activeTab === "analyze" && (
          <ScrollArea className="h-full bg-bg p-4 chat-scrollbar">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" className="text-muted/10" strokeWidth="8"/>
                    <circle 
                      cx="50" cy="50" r="44" fill="none" stroke="currentColor" className="text-accent transition-all duration-1000" strokeWidth="8" 
                      strokeDasharray="276" strokeDashoffset={276 - (276 * atsScore) / 100} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-display font-black text-text">{atsScore}%</span>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">ATS Score</span>
                  </div>
                </div>
                <h4 className="font-display font-black text-lg text-text mb-2">Resume Intelligence Score</h4>
                <p className="text-sm text-muted mb-6">Your resume is optimized for large enterprises but could improve in quantified metrics.</p>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full btn-premium py-4 text-xs font-black uppercase tracking-widest"
                >
                  {isAnalyzing ? "Analyzing..." : "Scan My Resume"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] px-2">Critical Suggestions</h5>
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border group hover:border-accent/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-text leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {activeTab === "interview" && (
          <ScrollArea className="h-full p-4 chat-scrollbar bg-card">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                <h4 className="font-display font-black text-xl mb-2 relative z-10">Ace Your Interview</h4>
                <p className="text-white/90 text-[13px] mb-6 relative z-10 leading-relaxed font-medium">
                  Get personalized questions based on your specific experience and target roles.
                </p>
                <button className="bg-white text-[#4f46e5] hover:bg-white/90 w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all relative z-10">
                  Generate Questions
                </button>
              </div>

              <div className="space-y-3">
                <h5 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] px-2">Potential Interview Topics</h5>
                {[
                  { icon: Brain, label: "Behavioral & Leadership", q: 12 },
                  { icon: Target, label: "Technical Competency", q: 8 },
                  { icon: Layout, label: "Project Architecture", q: 5 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-text">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-accent bg-accent/10 px-2.5 py-1 rounded-full group-hover:bg-accent group-hover:text-white transition-all">{item.q} Questions</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Bar - Only for Chat */}
      {activeTab === "chat" && (
        <div className="p-4 bg-card border-t border-border shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border-[1.5px] border-[#e2e8f0] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/5 transition-all min-h-[48px] max-h-[180px]"
          >
            <button 
              type="button" 
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-accent shrink-0 transition-colors self-end mb-[2px]"
            >
              <Plus className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={1000}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] leading-[1.5] text-[#1a1a1a] placeholder:text-muted p-0 m-0 resize-none min-h-[24px] max-h-[150px] chat-scrollbar font-medium self-center"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 shrink-0 self-end mb-[2px]",
                input.trim() ? "bg-accent text-white shadow-lg" : "text-muted bg-muted/10"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 text-center">
            <span className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">Intelligence Powered by Vogats AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
