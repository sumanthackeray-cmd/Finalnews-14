import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Undo2, RotateCw, Check, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateAIContent } from "@/lib/ai-service";
import { toast } from "sonner";

interface AIImproveButtonProps {
  label?: string;
  currentValue: string | string[];
  context: string;
  profileData: any;
  onUpdate: (newValue: string | string[]) => void;
  className?: string;
}

export function AIImproveButton({ 
  label = "Vogats AI write", 
  currentValue, 
  context, 
  profileData, 
  onUpdate,
  className 
}: AIImproveButtonProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState<(string | string[])[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleImprove = async () => {
    if (isBusy) return;
    
    // Validate if current value is empty
    const isEmpty = Array.isArray(currentValue) 
      ? currentValue.every(v => !v.trim()) 
      : !currentValue.trim();
      
    setIsBusy(true);
    setHistory(prev => [...prev, currentValue]);

    try {
      const res = await generateAIContent({
        action: "improve",
        data: {
          context,
          current: currentValue,
          ...profileData
        }
      });

      if (!res || (res as any).error) throw new Error((res as any)?.error ?? "AI failed to improve");

      const newValue = Array.isArray(currentValue) ? (res.bullets || []) : (res.text || "");
      
      // Streaming effect simulation (typing)
      simulateStreaming(newValue);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to improve content");
      setIsBusy(false);
    }
  };

  const simulateStreaming = (finalValue: string | string[]) => {
    setIsStreaming(true);
    setIsBusy(false);
    
    // For simplicity in this UI, we'll set it but we could add a character-by-character effect if needed.
    // The requirement asks for "streaming AI typing effect".
    // We'll update the value and use a CSS animation or a timeout loop.
    
    if (Array.isArray(finalValue)) {
      onUpdate(finalValue);
      setIsStreaming(false);
    } else {
      // Simple character-by-character for text
      let currentIdx = 0;
      const interval = setInterval(() => {
        onUpdate(finalValue.slice(0, currentIdx + 1));
        currentIdx++;
        if (currentIdx >= finalValue.length) {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 5); // Fast typing
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    onUpdate(previous);
    setHistory(prev => prev.slice(0, -1));
    toast.info("Restored previous version");
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {history.length > 0 && !isBusy && !isStreaming && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleUndo}
          className="h-7 px-2 text-[10px] font-bold text-muted hover:text-text gap-1"
        >
          <Undo2 className="w-3 h-3" />
          Undo
        </Button>
      )}
      
      <Button
        size="sm"
        onClick={handleImprove}
        disabled={isBusy || isStreaming}
        className={cn(
          "h-8 px-3 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all border-2",
          isBusy || isStreaming
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-white text-emerald-600 border-emerald-500 hover:bg-emerald-500 hover:text-white shadow-sm active:scale-95"
        )}
      >
        {isBusy ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : isStreaming ? (
          <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
        ) : (
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
        )}
        {isBusy ? "Analyzing..." : isStreaming ? "Writing..." : label}
      </Button>

      {(isBusy || isStreaming) && (
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
