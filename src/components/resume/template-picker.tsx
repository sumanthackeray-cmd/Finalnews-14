import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, LayoutTemplate } from "lucide-react";
import { TEMPLATES, ResumePreview } from "./templates";
import { sampleResume } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

export function TemplatePicker({
  value,
  onChange,
  data,
}: {
  value: string;
  onChange: (id: string) => void;
  data?: typeof sampleResume;
}) {
  const [open, setOpen] = useState(false);
  const previewData = data ?? sampleResume;
  const current = TEMPLATES.find((t) => t.id === value) ?? TEMPLATES[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1.5">
          <LayoutTemplate className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Template:</span>
          <span className="font-medium">{current.name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(92vw,720px)] p-3 max-h-[80vh] overflow-y-auto"
      >
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Choose a template
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => {
            const active = t.id === value;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "group relative rounded-lg border-2 bg-white overflow-hidden text-left transition hover:shadow-md",
                  active ? "border-coral shadow-soft" : "border-border",
                )}
              >
                <div className="aspect-[210/297] w-full overflow-hidden bg-white">
                  {/* Scaled-down real template preview */}
                  <div
                    className="origin-top-left pointer-events-none select-none"
                    style={{
                      width: "820px",
                      transform: "scale(0.28)",
                      transformOrigin: "top left",
                      height: "1160px",
                    }}
                  >
                    <ResumePreview template={t.id} data={previewData} />
                  </div>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 border-t bg-secondary/40">
                  <span className="text-xs font-medium">{t.name}</span>
                  {active && <Check className="h-3.5 w-3.5 text-coral" />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
