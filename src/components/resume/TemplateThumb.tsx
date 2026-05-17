import { useEffect, useRef, useState } from "react";
import { ResumePreview } from "./templates";
import { sampleResume, ResumeData } from "@/lib/resume-types";

// Native resume canvas dimensions (pixels)
const RESUME_W = 820;
const RESUME_H = 1160;
// A4 aspect ratio: height = width * (H/W)
const ASPECT = RESUME_H / RESUME_W; // ≈ 1.4146

interface Props {
  templateId: string;
  data?: ResumeData;
  className?: string;
  onUse?: () => void;
}

/**
 * Renders a live, perfectly-fitted scaled-down resume preview.
 * Uses ResizeObserver so it correctly fills any container size at any screen width.
 */
export function TemplateThumb({ templateId, data = sampleResume, className = "", onUse }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ scale: 0, height: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setDims({ scale: w / RESUME_W, height: Math.round(w * ASPECT) });
      }
    };

    // Initial measure with a slight delay to ensure container width is settled
    const timer = setTimeout(measure, 50);
    
    const ro = new ResizeObserver(() => {
      measure();
    });
    
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-white cursor-pointer ${className}`}
      style={{ height: dims.height || undefined, aspectRatio: dims.height ? undefined : `${RESUME_W}/${RESUME_H}` }}
      onClick={() => onUse?.()}
    >
      {dims.scale > 0 && (
        <div
          className="pointer-events-none select-none absolute top-0 left-0"
          style={{
            width: RESUME_W,
            height: RESUME_H,
            transform: `scale(${dims.scale})`,
            transformOrigin: "top left",
          }}
        >
          <ResumePreview template={templateId} data={data} />
        </div>
      )}

      {/* Hover overlay with "Use This" CTA */}
      {onUse && (
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-sm z-10"
        >
          <button
            className="btn-premium px-5 py-2.5 text-sm font-bold rounded-xl pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); onUse(); }}
          >
            Use This Template
          </button>
        </div>
      )}
    </div>
  );
}
