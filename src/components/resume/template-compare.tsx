import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, Trophy } from "lucide-react";
import { TEMPLATES, ResumePreview } from "./templates";
import type { ResumeData } from "@/lib/resume-types";
import { sampleResume } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

export function TemplateCompare({
  current,
  onSelect,
  data,
}: {
  current: string;
  onSelect: (id: string) => void;
  data?: ResumeData;
}) {
  const previewData = data ?? sampleResume;
  const [open, setOpen] = useState(false);
  const [a, setA] = useState<string>(current);
  const [b, setB] = useState<string>(TEMPLATES.find((t) => t.id !== current)?.id ?? TEMPLATES[1].id);

  const choose = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1.5">
          <GitCompare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Compare</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(96vw,1100px)] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-coral" /> Compare templates
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 mt-2">
          <Side label="A" value={a} onChange={setA} onChoose={choose} previewData={previewData} highlight={a === current} />
          <Side label="B" value={b} onChange={setB} onChoose={choose} previewData={previewData} highlight={b === current} />
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Tap <Trophy className="inline h-3 w-3 -mt-0.5 text-coral" /> Use this to pick the winner
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Side({
  label,
  value,
  onChange,
  onChoose,
  previewData,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onChoose: (id: string) => void;
  previewData: ResumeData;
  highlight: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-xl border-2 p-2", highlight ? "border-coral" : "border-border")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white rounded-md overflow-hidden border aspect-[210/297]">
        <div
          className="origin-top-left pointer-events-none select-none"
          style={{ width: "820px", height: "1160px", transform: "scale(0.18)", transformOrigin: "top left" }}
        >
          <ResumePreview template={value} data={previewData} />
        </div>
      </div>
      <Button size="sm" variant="ink" className="h-8" onClick={() => onChoose(value)}>
        <Trophy className="h-3.5 w-3.5 mr-1.5" /> Use this
      </Button>
    </div>
  );
}
