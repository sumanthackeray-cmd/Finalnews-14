import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { 
  X, Send, Loader2, Trash2, Maximize2, Minimize2, 
  Plus, Mic, Sparkles, Brain, FileText, Target,
  Pencil, CheckCircle, PlusCircle, Layout, MessageSquare,
  Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, ArrowDown, Paperclip
} from "lucide-react";
import { generateAIContent } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  attachmentName?: string;
  attachmentType?: string;
}

function getSuggestionsForResponse(content: string): string[] {
  const text = content.toLowerCase();
  
  if (text.includes("react") || text.includes("hook") || text.includes("component")) {
    return [
      "Explain useEffect simply",
      "Difference between useMemo and useCallback",
      "Best React project ideas",
      "Common React mistakes"
    ];
  }
  if (text.includes("code") || text.includes("program") || text.includes("javascript") || text.includes("typescript") || text.includes("html") || text.includes("css")) {
    return [
      "Show complete example",
      "Explain in simple words",
      "Best practices for clean code",
      "Common coding mistakes"
    ];
  }
  if (text.includes("resume") || text.includes("cv") || text.includes("ats") || text.includes("profile")) {
    return [
      "Check my resume ATS score",
      "Give me a professional summary rewrite",
      "List top key skills to include",
      "How to write quantified bullet points"
    ];
  }
  if (text.includes("business") || text.includes("marketing") || text.includes("strategy") || text.includes("revenue")) {
    return [
      "Create a detailed strategy plan",
      "Give me 5 unique marketing ideas",
      "Explain business revenue models",
      "Show real-world startup examples"
    ];
  }
  if (text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("animation")) {
    return [
      "How to improve this UI design?",
      "Add interactive micro-animations",
      "Suggest a premium color palette",
      "How to optimize for mobile screens?"
    ];
  }
  if (text.includes("interview") || text.includes("prep") || text.includes("question") || text.includes("career")) {
    return [
      "Give me role-specific mock questions",
      "How to prepare for coding interviews",
      "Tell me how to use the STAR method",
      "Write an elevator pitch for me"
    ];
  }
  
  return [
    "Tell me more about this",
    "Explain it to a beginner",
    "Can you give me an example?",
    "What are the best practices here?"
  ];
}

function formatRawUrlsToMarkdown(content: string): string {
  if (!content) return "";
  
  // Matches raw urls like http(s)://... or cv.vogats.com/... not already wrapped in markdown parenthesis/brackets
  // Strictly matches alphanumeric, dots, slashes, dashes, hashes, and query parameters to avoid swallowing asterisks or formatting tokens
  const urlRegex = /(?<!\(|\[)(https?:\/\/[a-zA-Z0-9\.\/_\-#\?&%=]+|cv\.vogats\.com[a-zA-Z0-9\.\/_\-#\?&%=]*)/gi;
  
  return content.replace(urlRegex, (url) => {
    let targetUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      targetUrl = `https://${url}`;
    }
    return `[${url}](${targetUrl})`;
  });
}

// Dynamic PDF.js library loader from CDN
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Pure client-side PDF text extraction in milliseconds
const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
    fullText += `--- Page ${i} ---\n${pageText}\n`;
  }
  return fullText;
};

// Dynamic Tesseract.js library loader from CDN
const loadTesseract = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Tesseract) {
      resolve((window as any).Tesseract);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js";
    script.onload = () => {
      resolve((window as any).Tesseract);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Pure client-side Image OCR text extraction
const extractTextFromImage = async (file: File): Promise<string> => {
  const Tesseract = await loadTesseract();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await Tesseract.recognize(
          reader.result as string,
          'eng'
        );
        resolve(result.data.text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function AIChatbot() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analyze" | "interview">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-assistant",
      role: "assistant",
      content: "Hi! I'm Vogats AI. How can I help you build, optimize, or tailor your resume today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  
  // Custom feedbacks/UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thumbsFeedback, setThumbsFeedback] = useState<Record<string, "up" | "down">>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollTopRef = useRef(0);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadSessions = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "chat_sessions"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSessions(list);
    } catch (err) {
      console.error("Error loading chat sessions:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, [user]);

  const handleNewChat = () => {
    setMessages([
      {
        id: "initial-assistant",
        role: "assistant",
        content: "Hi! I'm Vogats AI. How can I help you build, optimize, or tailor your resume today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setCurrentSessionId(null);
    setHistoryOpen(false);
    toast.success("Started a new chat session!");
  };

  const handleSelectSession = (session: any) => {
    setMessages(session.messages || []);
    setCurrentSessionId(session.id);
    setHistoryOpen(false);
    toast.success(`Loaded session: ${session.title}`);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "chat_sessions", sessionId));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      toast.success("Chat conversation deleted successfully!");
    } catch (err) {
      console.error("Error deleting session:", err);
      toast.error("Failed to delete chat conversation");
    }
  };

  const saveSession = async (currentMsgs: Message[]) => {
    if (!user) return;
    let sessionId = currentSessionId;
    let isNew = false;
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      setCurrentSessionId(sessionId);
      isNew = true;
    }

    const userMsgs = currentMsgs.filter(m => m.role === "user");
    const titleText = userMsgs.length > 0 
      ? (userMsgs[0].content.substring(0, 30) + (userMsgs[0].content.length > 30 ? "..." : ""))
      : "New Conversation";

    try {
      const sessionDocRef = doc(db, "chat_sessions", sessionId);
      const sessionData = {
        id: sessionId,
        userId: user.uid,
        title: titleText,
        messages: currentMsgs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(sessionDocRef, sessionData, { merge: true });
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionId);
        return [sessionData, ...filtered];
      });
    } catch (err) {
      console.error("Failed to save chat session to Firestore:", err);
    }
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-vogats-ai", handleOpenChat);
    return () => window.removeEventListener("open-vogats-ai", handleOpenChat);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis State
  const [atsScore, setAtsScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // File upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [attachedFileText, setAttachedFileText] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    setIsReadingFile(true);
    setAttachedFileText("");

    try {
      let extractedText = "";
      if (file.type === "application/pdf") {
        extractedText = await extractTextFromPdf(file);
      } else if (file.type.startsWith("image/")) {
        extractedText = await extractTextFromImage(file);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or an Image.");
      }
      setAttachedFileText(extractedText);
    } catch (err: any) {
      console.error("Error reading file:", err);
      toast.error(err.message || "Failed to read file contents.");
      setAttachedFile(null);
    } finally {
      setIsReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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

  // Handle mobile scroll lock and android back-button dismiss gesture
  useEffect(() => {
    if (isOpen) {
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
      
      if (window.history.state?.aiChat !== true) {
        window.history.pushState({ aiChat: true }, "");
      }

      const handlePopState = (e: PopStateEvent) => {
        setIsOpen(false);
        setIsFullScreen(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Smart scroll alignment
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Auto scroll if user hasn't scrolled up
    if (!userHasScrolledUp) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: streamingIndex !== null ? "auto" : "smooth"
      });
    } else if (streamingIndex !== null) {
      // User is scrolled up and AI is streaming -> notify
      setHasNewMessages(true);
    }
  }, [messages, streamingIndex, userHasScrolledUp]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    
    if (isAtBottom) {
      setUserHasScrolledUp(false);
      setShowScrollBottom(false);
      setHasNewMessages(false);
    } else {
      setUserHasScrolledUp(true);
      setShowScrollBottom(true);
    }

    const scrollTop = el.scrollTop;
    // Auto-hide AI header on scroll-down, reveal on scroll-up
    if (Math.abs(scrollTop - lastScrollTopRef.current) > 10) {
      if (scrollTop > lastScrollTopRef.current && scrollTop > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollTopRef.current = scrollTop <= 0 ? 0 : scrollTop;
    }
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      setUserHasScrolledUp(false);
      setShowScrollBottom(false);
      setHasNewMessages(false);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsFullScreen(false);
    if (window.history.state?.aiChat === true) {
      window.history.back();
    }
  };

  // Words streaming helper
  const streamAIResponse = (text: string) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    setIsLoading(false);
    const newMsgId = `ai-${Date.now()}`;
    const newMsgIndex = messages.length + 1; // since user message was just pushed

    setMessages((prev) => [
      ...prev,
      {
        id: newMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true
      }
    ]);

    setStreamingIndex(newMsgIndex);

    let currentText = "";
    let index = 0;
    const tokens = text.split(" "); // Natural token-by-token word reveal

    streamIntervalRef.current = setInterval(() => {
      if (index >= tokens.length) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setStreamingIndex(null);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === newMsgId) {
            last.isStreaming = false;
          }
          saveSession(updated);
          return updated;
        });
        return;
      }

      currentText += (index === 0 ? "" : " ") + tokens[index];
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.id === newMsgId) {
          last.content = currentText;
        }
        return updated;
      });

      index++;
    }, 10); // Instant, highly responsive conversational pacing (10ms per word reveal)
  };

  const handleSend = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading || streamingIndex !== null) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput("");

    // Lock file attachment data for this message
    const fileToPill = attachedFile;
    const fileTextToSend = attachedFileText;

    // Reset attachments state
    setAttachedFile(null);
    setAttachedFileText("");
    setIsReadingFile(false);
    
    // Reset scroll lock when sending a new message
    setUserHasScrolledUp(false);
    setShowScrollBottom(false);

    setMessages((prev) => {
      const updated = [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: messageToSend,
          timestamp,
          attachmentName: fileToPill?.name,
          attachmentType: fileToPill?.type
        }
      ];
      saveSession(updated);
      return updated;
    });
    setIsLoading(true);

    try {
      let promptToSend = messageToSend;
      if (fileToPill && fileTextToSend) {
        promptToSend = `[Attached File: ${fileToPill.name}]\nFile contents/text:\n"""\n${fileTextToSend}\n"""\n\nUser Question:\n${messageToSend}`;
      }

      const response = await generateAIContent({
        action: "chat",
        data: { message: promptToSend }
      });

      if (response.error) throw new Error(response.error);
      streamAIResponse(response.text);
    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { 
          id: `ai-err-${Date.now()}`,
          role: "assistant", 
          content: "I'm sorry, I encountered an error connecting to Vogats AI. Please try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleRegenerate = async () => {
    // Find last user message
    const userMsgs = messages.filter(m => m.role === "user");
    if (userMsgs.length === 0 || isLoading || streamingIndex !== null) return;
    const lastPrompt = userMsgs[userMsgs.length - 1].content;
    
    // Remove last assistant response if any
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant" && last.id !== "initial-assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });

    setIsLoading(true);
    try {
      const response = await generateAIContent({
        action: "chat",
        data: { message: lastPrompt }
      });

      if (response.error) throw new Error(response.error);
      streamAIResponse(response.text);
    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { 
          id: `ai-err-${Date.now()}`,
          role: "assistant", 
          content: "Failed to regenerate. Please try resending your message.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleEditMessage = (content: string) => {
    setInput(content);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Move selection cursor to the absolute end of the message text
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAtsScore(0);
    try {
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

  // Reset visibility automatically on every page navigation / route change
  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  if (!isVisible) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[999999] group/trigger">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-100 transition-all hover:scale-110 z-10"
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
          <div className="absolute inset-0 rounded-full bg-[#6366f1] animate-ping opacity-20" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed flex flex-col overflow-hidden z-[999999] shadow-2xl transition-all duration-300 ease-in-out",
        "inset-0 w-full h-[100dvh] rounded-none border-0 md:inset-x-0 md:bottom-0 md:top-auto md:w-full md:h-[85dvh] md:rounded-t-[2.5rem] md:border-t md:border-border",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        isFullScreen && "md:h-[100dvh] md:max-h-none md:rounded-none md:border-none"
      )}
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
      `}</style>

      {/* Header Wrapper - absolute positioned to overlay on top without physical flex height blocking scroll */}
      <div 
        className={cn(
          "absolute top-0 inset-x-0 border-b border-border flex flex-col px-4 transition-all duration-300 ease-in-out justify-center z-20",
          isHeaderVisible ? "translate-y-0 opacity-100 h-[25px] md:h-[35px]" : "-translate-y-full opacity-0 pointer-events-none h-0 border-b-0"
        )} 
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        <div className="flex items-center justify-between h-full w-full">
          <div className="flex items-center gap-1.5 md:gap-2.5">
            <img src={logo} alt="Vogats AI Logo" className="w-4 h-4 md:w-5 md:h-5 object-contain" />
            <div className="flex items-baseline gap-1">
              <h3 className="font-display font-black text-[10px] md:text-[13px] text-text leading-none">Vogats AI</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {user && (
              <button 
                onClick={() => setHistoryOpen(!historyOpen)}
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded transition-colors",
                  historyOpen ? "text-accent bg-accent/10" : "text-muted hover:bg-surface"
                )}
                title="Chat History"
              >
                <MessageSquare className="w-3 h-3" />
              </button>
            )}
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="hidden md:flex w-5 h-5 items-center justify-center rounded text-muted hover:bg-surface transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
            <button 
              onClick={handleCloseChat}
              className="w-5 h-5 flex items-center justify-center rounded text-muted hover:bg-surface transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - offset dynamically when header is visible */}
      {messages.length <= 1 && (
        <div 
          className="flex items-center px-4 py-2 gap-2 border-b border-border animate-in fade-in duration-200 shrink-0 transition-all duration-300" 
          style={{ 
            backgroundColor: "var(--card)",
            marginTop: isHeaderVisible ? (isMobile ? "25px" : "35px") : "0px"
          }}
        >
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
                  ? "bg-accent-solid text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] scale-[1.02]" 
                  : "text-muted hover:text-text hover:bg-surface"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-white" : "text-muted")} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Chat History Panel (Drawer) */}
        {user && historyOpen && (
          <div 
            className="absolute md:relative inset-y-0 left-0 w-full md:w-[280px] h-full z-30 border-r border-border shrink-0 flex flex-col animate-in slide-in-from-left duration-300 shadow-xl md:shadow-none"
            style={{ backgroundColor: "var(--card)" }}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text">Chat History</span>
              <button 
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 text-xs font-bold text-accent transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 chat-scrollbar">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted font-medium">
                  No past conversations.
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group/item text-left text-xs",
                      currentSessionId === s.id 
                        ? "bg-accent/10 text-accent font-bold" 
                        : "text-text hover:bg-surface font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted group-hover/item:text-accent" />
                      <span className="truncate">{s.title || "Conversation"}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 rounded text-muted hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Interface Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
          {activeTab === "chat" && (
          <div className="h-full relative flex flex-col">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto chat-scrollbar px-4 md:px-6 py-6 scroll-smooth space-y-8 transition-all duration-300"
              style={{
                paddingTop: isHeaderVisible ? (isMobile ? "35px" : "45px") : "10px"
              }}
            >
              <div className="space-y-8 w-full max-w-[850px] mx-auto">
                {messages.length <= 1 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                          className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-accent hover:bg-accent/5 group transition-all text-left shadow-sm hover:shadow-md"
                        >
                          <div className="w-10 h-10 rounded-xl bg-surface group-hover:bg-white flex items-center justify-center shrink-0 border border-border transition-colors">
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
                  messages.map((msg, i) => {
                    const isUser = msg.role === "user";
                    const isLastMsg = i === messages.length - 1;
                    const isLastAssistant = !isUser && msg.id !== "initial-assistant";

                    return (
                      <div 
                        key={msg.id || i} 
                        className={cn(
                          "flex flex-col gap-2 group/msg overflow-visible w-full",
                          isUser ? "items-end" : "items-start",
                          "animate-in fade-in slide-in-from-bottom-3 duration-300"
                        )}
                      >
                        {/* Message Bubble Container */}
                        <div 
                          className={cn(
                            "px-4 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all duration-300 relative",
                            isUser 
                              ? "text-white rounded-[24px_24px_4px_24px] max-w-[75%] bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 hover:shadow-indigo-500/10 hover:shadow-md hover:-translate-y-[1px]" 
                              : "bg-card border border-border/60 text-text rounded-[24px_24px_24px_4px] max-w-[90%] md:max-w-[85%] hover:border-accent-solid/20"
                          )}
                        >
                          {msg.attachmentName && (
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-2 mb-2 rounded-xl border max-w-full truncate",
                              isUser 
                                ? "bg-white/10 border-white/20 text-white" 
                                : "bg-[#6366f1]/5 border-[#6366f1]/20 text-text"
                            )}>
                              {msg.attachmentType === "application/pdf" ? (
                                <FileText className={cn("w-4 h-4 shrink-0", isUser ? "text-white" : "text-accent-solid")} />
                              ) : (
                                <Layout className={cn("w-4 h-4 shrink-0", isUser ? "text-white" : "text-accent-solid")} />
                              )}
                              <span className="text-[11px] font-bold truncate">{msg.attachmentName}</span>
                            </div>
                          )}

                          <div className={cn(
                            "prose prose-sm max-w-none break-words leading-relaxed",
                            isUser ? "text-white prose-invert" : "text-text"
                          )}>
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <div className="relative my-3 rounded-2xl overflow-hidden border border-border/80 shadow-md">
                                      <div className="flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border/60 text-[10px] font-black uppercase tracking-wider text-muted">
                                        <span>{match[1]}</span>
                                        <button
                                          type="button"
                                          onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), msg.id)}
                                          className="hover:text-text transition-colors flex items-center gap-1 font-bold"
                                        >
                                          {copiedId === msg.id ? (
                                            <>
                                              <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale" />
                                              <span>Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3.5 h-3.5" />
                                              <span>Copy</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-4 bg-[#1e1e2f] text-slate-100 overflow-x-auto text-xs leading-relaxed font-mono">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className="bg-soft border border-border/50 px-1.5 py-0.5 rounded text-accent-solid font-mono font-bold text-xs" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                table({ children }) {
                                  return (
                                    <div className="my-4 overflow-x-auto rounded-xl border border-border/60 shadow-sm">
                                      <table className="min-w-full divide-y divide-border/60 text-xs">
                                        {children}
                                      </table>
                                    </div>
                                  );
                                },
                                thead({ children }) {
                                  return <thead className="bg-muted/40">{children}</thead>;
                                },
                                th({ children }) {
                                  return <th className="px-4 py-2 text-left font-black text-text border-b border-border/60 uppercase tracking-wider">{children}</th>;
                                },
                                td({ children }) {
                                  return <td className="px-4 py-2 text-muted border-b border-border/45 font-medium">{children}</td>;
                                },
                                a({ href, children }) {
                                  return (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-solid hover:underline font-bold inline-flex items-center gap-1">
                                      {children}
                                    </a>
                                  );
                                },
                                ul({ children }) {
                                  return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                                },
                                ol({ children }) {
                                  return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                                },
                                li({ children }) {
                                  return <li className="text-[13px] leading-relaxed font-medium text-text">{children}</li>;
                                },
                                p({ children }) {
                                  return <p className="text-[13px] leading-relaxed my-2 text-text">{children}</p>;
                                }
                              }}
                            >
                              {formatRawUrlsToMarkdown(msg.content)}
                            </ReactMarkdown>

                            {/* Blinking Cursor during Streaming */}
                            {streamingIndex === i && (
                              <span className="inline-block w-2.5 h-4 ml-1 bg-accent-solid rounded-sm animate-[pulse_1s_infinite] shrink-0 align-middle" />
                            )}
                          </div>
                        </div>

                        {/* Action buttons strictly below bubble */}
                        <div className={cn("flex flex-wrap items-center gap-2 mt-1.5 overflow-visible z-10 w-full", isUser ? "justify-end" : "justify-start")}>
                          {isUser ? (
                            <>
                              <button
                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                className="h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-muted hover:text-text hover:bg-surface hover:shadow-md hover:border-accent-solid/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                title="Copy prompt"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-[scale_0.2s]" />
                                    <span className="text-emerald-500 font-black">Copied ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleEditMessage(msg.content)}
                                className="h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-muted hover:text-text hover:bg-surface hover:shadow-md hover:border-accent-solid/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                title="Edit prompt"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <span className="text-[9px] text-muted/60 font-semibold uppercase tracking-wider ml-1 self-center">{msg.timestamp}</span>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                className="h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-muted hover:text-text hover:bg-surface hover:shadow-md hover:border-accent-solid/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                title="Copy answer"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-[scale_0.2s]" />
                                    <span className="text-emerald-500 font-black">Copied ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              
                              {isLastAssistant && (
                                <button
                                  onClick={handleRegenerate}
                                  className="h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-muted hover:text-text hover:bg-surface hover:shadow-md hover:border-accent-solid/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  title="Regenerate answer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Retry</span>
                                </button>
                              )}

                              <button
                                onClick={() => setThumbsFeedback(prev => ({ ...prev, [msg.id]: "up" }))}
                                className={cn(
                                  "h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted hover:text-emerald-500 hover:bg-surface hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer",
                                  thumbsFeedback[msg.id] === "up" && "text-emerald-500 bg-surface border-emerald-500/35"
                                )}
                                title="Thumbs up"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setThumbsFeedback(prev => ({ ...prev, [msg.id]: "down" }))}
                                className={cn(
                                  "h-8 px-2.5 rounded-full bg-card/60 dark:bg-card/35 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted hover:text-red-500 hover:bg-surface hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer",
                                  thumbsFeedback[msg.id] === "down" && "text-red-500 bg-surface border-red-500/35"
                                )}
                                title="Thumbs down"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-[9px] text-muted/60 font-semibold uppercase tracking-wider ml-1 self-center">{msg.timestamp}</span>
                            </>
                          )}
                        </div>

                        {/* Suggestion Chips Container strictly below bubble and action buttons */}
                        {!isUser && isLastMsg && !isLoading && streamingIndex === null && (
                          <div 
                            className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full justify-start overflow-visible"
                            style={{ animationDelay: "0.2s" }}
                          >
                            {getSuggestionsForResponse(msg.content).map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="px-4 py-2 rounded-full bg-card/65 dark:bg-card/35 border border-border/60 hover:border-accent-solid/35 backdrop-blur-md text-xs font-bold text-muted hover:text-text hover:bg-surface hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                                style={{
                                  animation: `fadeInUp 0.4s ease-out both`,
                                  animationDelay: `${idx * 0.08}s`
                                }}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Animated typing dots block immediately after send */}
                {isLoading && (
                  <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-card border border-border px-4 py-3.5 rounded-[24px_24px_24px_4px] flex items-center gap-1.5 shadow-sm">
                      {[0, 1, 2].map((dot) => (
                        <div 
                          key={dot} 
                          className="w-1.5 h-1.5 bg-accent-solid rounded-full"
                          style={{ animation: `pulseDot 1.4s infinite ease-in-out both`, animationDelay: `${dot * 0.16}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Scroll to Bottom Floating Pill */}
            {showScrollBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-card border border-border/80 text-text rounded-full py-2 px-4 shadow-xl hover:shadow-2xl transition-all active:scale-95 z-30 flex items-center gap-2 hover:border-accent-solid group animate-bounce"
              >
                <ArrowDown className="w-4 h-4 text-accent-solid group-hover:translate-y-[1px] transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {hasNewMessages ? "New Answer Below" : "Scroll to bottom"}
                </span>
                {hasNewMessages && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </button>
            )}
          </div>
        )}

        {activeTab === "analyze" && (
          <div className="h-full bg-bg overflow-y-auto chat-scrollbar p-4 scroll-smooth">
            <div className="space-y-6 max-w-[850px] mx-auto">
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
          </div>
        )}

        {activeTab === "interview" && (
          <div className="h-full p-4 overflow-y-auto chat-scrollbar bg-card scroll-smooth">
            <div className="space-y-6 max-w-[850px] mx-auto">
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
          </div>
        )}
        </div>
      </div>

      {/* Input Bar - Only for Chat */}
      {activeTab === "chat" && (
        <div className="px-4 pt-3 pb-1 border-t border-border shrink-0 bg-card/95 backdrop-blur-lg relative z-20">
          <div className="w-full relative max-w-[850px] mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex flex-col gap-2 p-3 bg-surface border border-border/80 rounded-[24px] shadow-lg focus-within:border-accent-solid focus-within:ring-4 focus-within:ring-accent-solid/5 transition-all duration-300"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf" 
                className="hidden" 
              />

              {/* File Preview Container inside the form above textarea */}
              {attachedFile && (
                <div className="flex items-center gap-3 p-2.5 mx-1 mb-2 bg-[#6366f1]/5 dark:bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent-solid/10 flex items-center justify-center text-accent-solid shrink-0">
                    {attachedFile.type === "application/pdf" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Layout className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">
                      {isReadingFile ? (
                        <span className="flex items-center gap-1 text-[#6366f1]">
                          <Loader2 className="w-3 h-3 animate-spin" /> Reading file content...
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                          ✓ File content ready for AI
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null);
                      setAttachedFileText("");
                      setIsReadingFile(false);
                    }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Attachment button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-accent-solid hover:bg-soft transition-all duration-200"
                  title="Attach files (PDF, JPG, PNG)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Textarea */}
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
                  placeholder={attachedFile ? "Ask anything about this file..." : "Ask Vogats AI anything..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] leading-relaxed placeholder:text-muted/70 p-1 resize-none min-h-[30px] max-h-[140px] chat-scrollbar font-medium focus:outline-none"
                />

                {/* Voice button */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-accent-solid hover:bg-soft transition-all duration-200"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={isLoading || streamingIndex !== null || isReadingFile || (!input.trim() && !attachedFileText)}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                    (input.trim() || (attachedFileText && !isReadingFile)) && streamingIndex === null
                      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95"
                      : "bg-muted/10 text-muted/50 cursor-not-allowed"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            <div className="mt-1 text-center">
              <span className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">Intelligence Powered by Vogats AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
