import type { ResumeData } from "@/lib/resume-types";

export const isValidPhoto = (photo?: string) => {
  if (!photo) return false;
  const trimmed = photo.trim();
  if (trimmed === "" || trimmed === "undefined" || trimmed === "null" || trimmed === "data:,") return false;
  if (trimmed.startsWith("data:") && !trimmed.includes(",")) return false;
  return true;
};

export function ModernTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  return (
    <div className="bg-white text-[#111] p-12 font-sans text-[11px] leading-[1.55]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <header className="border-b-2 border-[#111] pb-6">
        <h1 className="text-[34px] font-bold tracking-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>{basics.name || "Your Name"}</h1>
        <p className="text-[14px] text-[#444] mt-1">{basics.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10.5px] text-[#555]">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>· {basics.phone}</span>}
          {basics.location && <span>· {basics.location}</span>}
          {basics.website && <span>· {basics.website}</span>}
        </div>
      </header>

      {basics.summary && (
        <section className="mt-6">
          <p className="text-[#222]">{basics.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((e) => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{e.role}</p>
                  <p className="text-[#555]">{e.company}{e.location && ` · ${e.location}`}</p>
                </div>
                <p className="text-[#777] whitespace-nowrap">{e.start} – {e.end}</p>
              </div>
              <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[#222]">
                {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((e) => (
            <div key={e.id} className="mb-3 flex justify-between gap-4">
              <div>
                <p className="font-semibold">{e.school}</p>
                <p className="text-[#555]">{e.degree}</p>
                {e.notes && <p className="text-[#666] mt-0.5">{e.notes}</p>}
              </div>
              <p className="text-[#777] whitespace-nowrap">{e.start} – {e.end}</p>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <p className="text-[#222]">{skills.join(" · ")}</p>
        </Section>
      )}

      {data.hobbies && data.hobbies.length > 0 && (
        <Section title="Hobbies">
          <p className="text-[#222]">{data.hobbies.join(" · ")}</p>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="font-semibold">{p.name} {p.link && <span className="text-[#777] font-normal">— {p.link}</span>}</p>
              <p className="text-[#444]">{p.description}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#111] border-b border-[#ddd] pb-1.5 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  return (
    <div className="bg-white text-[#1a1a1a] p-12 text-[11px] leading-[1.6]" style={{ fontFamily: "'Times New Roman', serif" }}>
      <header className="text-center">
        <h1 className="text-[28px] font-bold tracking-wide uppercase">{basics.name || "Your Name"}</h1>
        <p className="text-[13px] italic text-[#444] mt-1">{basics.title}</p>
        <p className="mt-2 text-[10.5px] text-[#555]">
          {[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).join(" • ")}
        </p>
      </header>
      {basics.summary && <p className="mt-5 text-[#222]">{basics.summary}</p>}

      {experience.length > 0 && (
        <SectionClassic title="Experience">
          {experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between">
                <p><span className="font-bold">{e.company}</span> — <span className="italic">{e.role}</span></p>
                <p className="text-[#555]">{e.start}–{e.end}</p>
              </div>
              <ul className="list-disc pl-5 mt-1">
                {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </SectionClassic>
      )}

      {education.length > 0 && (
        <SectionClassic title="Education">
          {education.map((e) => (
            <div key={e.id} className="mb-2 flex justify-between">
              <p><span className="font-bold">{e.school}</span>, {e.degree}</p>
              <p className="text-[#555]">{e.start}–{e.end}</p>
            </div>
          ))}
        </SectionClassic>
      )}

      {skills.length > 0 && (
        <SectionClassic title="Skills"><p>{skills.join(", ")}</p></SectionClassic>
      )}

      {data.hobbies && data.hobbies.length > 0 && (
        <SectionClassic title="Hobbies"><p>{data.hobbies.join(", ")}</p></SectionClassic>
      )}

      {projects.length > 0 && (
        <SectionClassic title="Projects">
          {projects.map((p) => (
            <p key={p.id} className="mb-1"><span className="font-bold">{p.name}.</span> {p.description} {p.link && <span className="italic">({p.link})</span>}</p>
          ))}
        </SectionClassic>
      )}
    </div>
  );
}

function SectionClassic({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-[#1a1a1a] pb-0.5 mb-2">{title}</h2>
      {children}
    </section>
  );
}

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  return (
    <div className="bg-white text-[#111] flex text-[10.5px] leading-[1.55]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <aside className="w-[36%] bg-[#1a1a2e] text-white p-8">
        <h1 className="text-[24px] font-bold leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>{basics.name || "Your Name"}</h1>
        <p className="text-[#ff7e5f] mt-1 text-[12px]">{basics.title}</p>
        <div className="mt-6 space-y-1.5 text-white/80">
          {basics.email && <p>{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}
          {basics.location && <p>{basics.location}</p>}
          {basics.website && <p>{basics.website}</p>}
        </div>
        {skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{s}</span>
              ))}
            </div>
          </div>
        )}
        {data.hobbies && data.hobbies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-3">Hobbies</h2>
            <p className="text-white/80">{data.hobbies.join(", ")}</p>
          </div>
        )}
        {education.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-3">Education</h2>
            {education.map((e) => (
              <div key={e.id} className="mb-3">
                <p className="font-semibold">{e.school}</p>
                <p className="text-white/70">{e.degree}</p>
                <p className="text-white/50 text-[10px]">{e.start} – {e.end}</p>
              </div>
            ))}
          </div>
        )}
      </aside>
      <main className="flex-1 p-8">
        {basics.summary && (
          <section className="mb-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-2">Profile</h2>
            <p className="text-[#222]">{basics.summary}</p>
          </section>
        )}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-3">Experience</h2>
            {experience.map((e) => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between">
                  <p className="font-bold">{e.role}</p>
                  <p className="text-[#777] text-[10px]">{e.start} – {e.end}</p>
                </div>
                <p className="text-[#555]">{e.company}{e.location && ` · ${e.location}`}</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[#222]">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}
        {projects.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#ff7e5f] mb-3">Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-2">
                <p className="font-semibold">{p.name}</p>
                <p className="text-[#444]">{p.description}</p>
                {p.link && <p className="text-[#777] text-[10px]">{p.link}</p>}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  return (
    <div className="bg-white text-[#111] p-14 text-[11px] leading-[1.6]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 className="text-[42px] font-light tracking-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>{basics.name || "Your Name"}</h1>
      <p className="text-[13px] text-[#666] mt-0.5">{basics.title}</p>
      <p className="mt-2 text-[10.5px] text-[#888]">
        {[basics.email, basics.phone, basics.location, basics.website].filter(Boolean).join("   ·   ")}
      </p>
      {basics.summary && <p className="mt-8 text-[#333] max-w-[60ch]">{basics.summary}</p>}

      {experience.length > 0 && (
        <SectionMin title="Experience">
          {experience.map((e) => (
            <div key={e.id} className="grid grid-cols-[110px_1fr] gap-6 mb-4">
              <p className="text-[#888]">{e.start} – {e.end}</p>
              <div>
                <p className="font-medium">{e.role} · <span className="text-[#666] font-normal">{e.company}</span></p>
                <ul className="mt-1 space-y-0.5 text-[#333]">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>— {b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </SectionMin>
      )}

      {education.length > 0 && (
        <SectionMin title="Education">
          {education.map((e) => (
            <div key={e.id} className="grid grid-cols-[110px_1fr] gap-6 mb-2">
              <p className="text-[#888]">{e.start} – {e.end}</p>
              <p><span className="font-medium">{e.school}</span> — {e.degree}</p>
            </div>
          ))}
        </SectionMin>
      )}

      {skills.length > 0 && (
        <SectionMin title="Skills">
          <p className="text-[#333]">{skills.join("   ·   ")}</p>
        </SectionMin>
      )}

      {data.hobbies && data.hobbies.length > 0 && (
        <SectionMin title="Hobbies">
          <p className="text-[#333]">{data.hobbies.join("   ·   ")}</p>
        </SectionMin>
      )}

      {projects.length > 0 && (
        <SectionMin title="Projects">
          {projects.map((p) => (
            <div key={p.id} className="grid grid-cols-[110px_1fr] gap-6 mb-2">
              <p className="text-[#888]">{p.link}</p>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-[#444]">{p.description}</p>
              </div>
            </div>
          ))}
        </SectionMin>
      )}
    </div>
  );
}

function SectionMin({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function DesignerTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  const tools = data.tools ?? [];
  const references = data.references ?? [];
  const TAN = "#c89679";
  const TAN_SOFT = "#f0d4c2";
  const CREAM = "#fbf3ec";
  const DARK = "#3a2418";

  return (
    <div className="bg-white text-[#1a1a1a] grid grid-cols-[38%_62%] text-[10.5px] leading-[1.55]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Left sidebar */}
      <aside style={{ background: CREAM }} className="p-7">
        {/* Photo block */}
        <div className="relative mb-6">
          <div style={{ background: TAN }} className="aspect-[4/5] w-full flex items-center justify-center overflow-hidden">
            {isValidPhoto(basics.photo) ? (
              <img src={basics.photo} alt={basics.name} className="w-[78%] aspect-square rounded-full object-cover" />
            ) : (
              <div className="w-[78%] aspect-square rounded-full bg-white/30 flex items-center justify-center text-white/70 text-xs">Photo</div>
            )}
          </div>
          <div style={{ background: DARK }} className="absolute top-0 left-0 w-[18%] h-[35%]" />
        </div>

        <SidebarSection title="Contact" dark={DARK}>
          <div className="space-y-2 text-[10px]">
            {basics.phone && <Row icon="phone" dark={DARK}>{basics.phone}</Row>}
            {basics.email && <Row icon="mail" dark={DARK}>{basics.email}</Row>}
            {basics.location && <Row icon="pin" dark={DARK}>{basics.location}</Row>}
            {basics.website && <Row icon="web" dark={DARK}>{basics.website}</Row>}
          </div>
        </SidebarSection>

        {skills.length > 0 && (
          <SidebarSection title="Skills" dark={DARK}>
            <ul className="space-y-1">
              {skills.map((s, i) => (
                <li key={i} className="flex gap-2"><span style={{ color: DARK }}>•</span><span>{s}</span></li>
              ))}
            </ul>
          </SidebarSection>
        )}

        {data.hobbies && data.hobbies.length > 0 && (
          <SidebarSection title="Hobbies" dark={DARK}>
            <p className="text-[10px]">{data.hobbies.join(", ")}</p>
          </SidebarSection>
        )}

        {tools.length > 0 && (
          <SidebarSection title="Tools" dark={DARK}>
            <ul className="space-y-2.5">
              {tools.map((t) => (
                <li key={t.id}>
                  <div className="flex justify-between mb-1">
                    <span className="flex gap-2"><span style={{ color: DARK }}>•</span>{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: TAN_SOFT }}>
                      <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, t.level))}%`, background: TAN }} />
                    </div>
                    <span className="text-[9.5px] w-8 text-right" style={{ color: DARK }}>{t.level}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </SidebarSection>
        )}
      </aside>

      {/* Main column */}
      <main className="p-7 pl-8" style={{ background: "#fff" }}>
        <header className="mb-5">
          <h1 className="text-[34px] font-extrabold tracking-tight leading-[1.05]" style={{ color: DARK }}>{basics.name || "Your Name"}</h1>
          <div className="mt-2 py-1.5" style={{ background: CREAM }}>
            <p className="text-center text-[12px] tracking-[0.3em] font-bold" style={{ color: DARK }}>{(basics.title || "Your Title").toUpperCase()}</p>
          </div>
        </header>

        {basics.summary && (
          <MainSection title="Personal Info" dark={DARK}>
            <p className="text-[#222]">{basics.summary}</p>
          </MainSection>
        )}

        {education.length > 0 && (
          <MainSection title="Education" dark={DARK}>
            {education.map((e) => (
              <Item key={e.id} dark={DARK} title={e.degree} subtitle={e.school} period={`${e.start}-${e.end}`} />
            ))}
          </MainSection>
        )}

        {experience.length > 0 && (
          <MainSection title="Experience" dark={DARK}>
            {experience.map((e) => (
              <div key={e.id} className="mb-3">
                <Item dark={DARK} title={e.role} subtitle={e.company} period={`${e.start}-${e.end}`} />
                {e.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-1.5 ml-7 space-y-0.5 text-[#222]">
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="flex gap-2"><span style={{ color: DARK }}>•</span><span>{b}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </MainSection>
        )}

        {references.length > 0 && (
          <div className="mt-4 p-4" style={{ background: CREAM }}>
            <h2 className="text-[12px] font-extrabold tracking-[0.25em] mb-2" style={{ color: DARK }}>REFERENCE</h2>
            <ul className="space-y-1.5">
              {references.map((r) => (
                <li key={r.id}>
                  <p className="font-bold" style={{ color: DARK }}>• {r.name}{r.role && ` - ${r.role}`}</p>
                  <div className="ml-3 flex justify-between text-[10px] text-[#444]">
                    <span>{r.email}</span><span>{r.phone}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {projects.length > 0 && (
          <MainSection title="Projects" dark={DARK}>
            {projects.map((p) => (
              <div key={p.id} className="mb-1.5 ml-7">
                <p className="font-semibold" style={{ color: DARK }}>{p.name}</p>
                <p className="text-[#444]">{p.description}</p>
              </div>
            ))}
          </MainSection>
        )}
      </main>
    </div>
  );
}

function MainSection({ title, dark, children }: { title: string; dark: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="text-[14px] font-extrabold tracking-[0.25em] mb-2.5" style={{ color: dark }}>{title.toUpperCase()}</h2>
      {children}
    </section>
  );
}

function SidebarSection({ title, dark, children }: { title: string; dark: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[13px] font-extrabold tracking-[0.3em] mb-3" style={{ color: dark }}>{title.toUpperCase()}</h2>
      {children}
    </section>
  );
}

function Item({ title, subtitle, period, dark }: { title: string; subtitle: string; period: string; dark: string }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] shrink-0" style={{ background: dark }}>›</div>
      <div className="flex-1 flex justify-between gap-3">
        <div>
          <p className="font-bold" style={{ color: dark }}>{title}</p>
          <p className="italic text-[#666]">{subtitle}</p>
        </div>
        <p className="font-bold whitespace-nowrap" style={{ color: dark }}>{period}</p>
      </div>
    </div>
  );
}

function Row({ icon, dark, children }: { icon: string; dark: string; children: React.ReactNode }) {
  const path: Record<string, string> = {
    phone: "M2 4a2 2 0 012-2h2l2 4-2 1a10 10 0 005 5l1-2 4 2v2a2 2 0 01-2 2A14 14 0 012 4z",
    mail: "M2 4h16v12H2zM2 4l8 6 8-6",
    pin: "M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6zm0 4a2 2 0 100 4 2 2 0 000-4z",
    web: "M10 2a8 8 0 100 16 8 8 0 000-16zM2 10h16M10 2c2 3 2 13 0 16M10 2c-2 3-2 13 0 16",
  };
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: dark }}>
        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={path[icon]} />
        </svg>
      </div>
      <span className="break-all">{children}</span>
    </div>
  );
}

/* ============== AVERY (Orange + circles) ============== */
export function AveryTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  const refs = data.references ?? [];
  const langs = data.languages ?? [];
  const ORANGE = "#f59121";
  return (
    <div className="bg-white text-[#1a1a1a] relative overflow-hidden text-[10.5px] leading-[1.55]" style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1160 }}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full" style={{ background: ORANGE }} />
      <div className="absolute top-16 left-44 w-24 h-24 rounded-full" style={{ background: ORANGE }} />
      <div className="absolute -top-16 right-10 w-56 h-56 rounded-full" style={{ background: ORANGE }} />
      <div className="absolute top-[42%] -right-20 w-56 h-56 rounded-full bg-[#ececec]" />
      <div className="absolute top-[55%] -left-24 w-72 h-72 rounded-full bg-[#ececec]" />
      <div className="absolute bottom-4 right-16 w-10 h-10 rounded-full" style={{ background: ORANGE }} />
      <div className="absolute -bottom-16 right-6 w-44 h-44 rounded-full" style={{ background: ORANGE }} />

      <div className="relative px-10 pt-10 pb-12">
        {/* Header */}
        <div className="flex gap-8 items-end">
          <div className="w-40 h-40 rounded-full bg-gray-300 border-4 border-gray-300 overflow-hidden shrink-0">
            {isValidPhoto(basics.photo) ? (
              <img src={basics.photo} alt={basics.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xs">Photo</div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-[38px] font-extrabold tracking-tight leading-none">{(basics.name || "Your Name").toUpperCase()}</h1>
            <p className="text-[20px] font-extrabold mt-1" style={{ color: ORANGE }}>{(basics.title || "Your Title").toUpperCase()}</p>
            <div className="border-b-2 border-black mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-[40%_60%] gap-8 mt-8">
          {/* Left col */}
          <div>
            <AverySection title="Profile" />
            <p className="text-[#222]">{basics.summary}</p>

            <AverySection title="Education History" className="mt-6" />
            {education.map((e) => (
              <div key={e.id} className="mb-4 flex gap-2">
                <span style={{ color: ORANGE }} className="text-base shrink-0">↪</span>
                <div>
                  <p className="font-bold">{e.degree}</p>
                  <p className="font-bold">{e.start} - {e.end}</p>
                  <p className="text-[#444]">{e.school}</p>
                </div>
              </div>
            ))}

            {langs.length > 0 && (
              <>
                <AverySection title="Languages" className="mt-6" />
                <ul className="grid grid-cols-2 gap-y-1 list-disc pl-4">
                  {langs.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </>
            )}

            <AverySection title="Contact Info" className="mt-6" />
            <div className="space-y-2">
              {basics.phone && <AveryRow icon="phone">{basics.phone}</AveryRow>}
              {basics.email && <AveryRow icon="mail">{basics.email}</AveryRow>}
              {basics.location && <AveryRow icon="home">{basics.location}</AveryRow>}
            </div>
          </div>

          {/* Right col */}
          <div>
            <AverySection title="Skills" />
            <div className="grid grid-cols-2 gap-y-1">
              {skills.map((s, i) => <div key={i} className="flex gap-2"><span>•</span>{s}</div>)}
            </div>

            {data.hobbies && data.hobbies.length > 0 && (
              <>
                <AverySection title="Hobbies" className="mt-6" />
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {data.hobbies.map((h, i) => <div key={i} className="flex gap-2"><span>•</span>{h}</div>)}
                </div>
              </>
            )}

            <AverySection title="Work Experience" className="mt-6" />
            {experience.map((e) => (
              <div key={e.id} className="mb-4">
                <div className="flex gap-2">
                  <span style={{ color: ORANGE }} className="text-base shrink-0">↪</span>
                  <div>
                    <p className="font-bold">{e.role}</p>
                    <p className="font-bold">{e.company}{e.start && `,  ${e.start} - ${e.end}`}</p>
                  </div>
                </div>
                <ul className="mt-1.5 ml-7 list-disc pl-4 space-y-0.5 text-[#222]">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}

            {refs.length > 0 && (
              <>
                <AverySection title="References" className="mt-6" />
                <div className="grid grid-cols-2 gap-4">
                  {refs.map((r) => (
                    <div key={r.id}>
                      <p className="font-bold">{r.name}</p>
                      <p>{r.role}</p>
                      <p>{r.phone}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {projects.length > 0 && (
              <>
                <AverySection title="Projects" className="mt-6" />
                {projects.map((p) => (
                  <div key={p.id} className="mb-2">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[#444]">{p.description}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AverySection({ title, className = "" }: { title: string; className?: string }) {
  return <h2 className={`text-[20px] font-extrabold underline underline-offset-4 mb-3 ${className}`}>{title}</h2>;
}

function AveryRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  const path: Record<string, string> = {
    phone: "M2 4a2 2 0 012-2h2l2 4-2 1a10 10 0 005 5l1-2 4 2v2a2 2 0 01-2 2A14 14 0 012 4z",
    mail: "M2 4h16v12H2zM2 4l8 6 8-6",
    home: "M3 10l7-6 7 6v8H3z",
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white shrink-0">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={path[icon]} />
        </svg>
      </div>
      <span>{children}</span>
    </div>
  );
}

/* ============== SLATER (Peach minimal cover-letter style) ============== */
export function SlaterTemplate({ data }: { data: ResumeData }) {
  const { basics, skills, experience } = data;
  const PEACH = "#f6cfc1";
  const GRAY = "#d6d6d6";
  return (
    <div className="bg-white text-[#222] relative text-[10.5px] leading-[1.6]" style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1160 }}>
      {/* Top angled bands */}
      <div className="absolute top-0 left-0 right-0 h-32" style={{ background: GRAY, clipPath: "polygon(0 0, 100% 0, 60% 100%, 0 80%)" }} />
      <div className="absolute top-0 right-0 h-40 w-[55%]" style={{ background: PEACH, clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 70%)" }} />

      <div className="relative grid grid-cols-[36%_64%]">
        {/* Sidebar */}
        <aside className="px-8 pt-44 pb-10">
          <div className="absolute top-16 left-10 w-32 h-32 rounded-full bg-white border-4 border-white overflow-hidden shadow">
            {isValidPhoto(basics.photo) ? <img src={basics.photo} alt={basics.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
          </div>
          <h1 className="text-[26px] font-extrabold leading-tight">{(basics.name || "Your Name").toUpperCase()}</h1>
          <p className="text-[11px] tracking-[0.2em] mt-1" style={{ color: "#b9836f" }}>{(basics.title || "").toUpperCase()}</p>
          <div className="h-px mt-4 mb-5" style={{ background: PEACH }} />

          <SlaterH>Who am I</SlaterH>
          <p className="text-[#444]">{basics.summary}</p>

          {skills.length > 0 && (
            <>
              <SlaterH className="mt-5">Skills</SlaterH>
              <ul className="space-y-2.5">
                {skills.slice(0, 5).map((s, i) => {
                  const lvl = 60 + ((i * 13) % 35);
                  return (
                    <li key={i}>
                      <p className="text-[10px] mb-1">{s}</p>
                      <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: GRAY }}>
                        <div style={{ width: `${lvl}%`, background: PEACH }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {data.hobbies && data.hobbies.length > 0 && (
            <>
              <SlaterH className="mt-5">Hobbies</SlaterH>
              <p className="text-[10px] text-[#444]">{data.hobbies.join(", ")}</p>
            </>
          )}

          <SlaterH className="mt-5">Contact</SlaterH>
          <div className="space-y-1 text-[#444]">
            {basics.phone && <p>{basics.phone}</p>}
            {basics.email && <p>{basics.email}</p>}
            {basics.website && <p>{basics.website}</p>}
            {basics.location && <p>{basics.location}</p>}
          </div>
        </aside>

        {/* Letter body */}
        <main className="px-8 pt-44 pb-10">
          <div className="flex justify-between text-[10.5px] mb-4">
            <div>
              <p className="font-bold">Hiring Manager</p>
              <p className="text-[#555]">{basics.location}</p>
            </div>
            <p className="text-[#555]">{new Date().toLocaleDateString()}</p>
          </div>
          <p className="font-bold mb-3">Dear Hiring Manager,</p>
          <p className="text-[#333] mb-3">{basics.summary}</p>
          {experience.slice(0, 2).map((e) => (
            <p key={e.id} className="text-[#333] mb-3">
              At <b>{e.company}</b> as <b>{e.role}</b> ({e.start}–{e.end}), {e.bullets.filter(Boolean).join(" ")}
            </p>
          ))}
          <p className="text-[#333] mb-6">I would welcome the opportunity to discuss how my experience can contribute to your team.</p>
          <p>Sincerely,</p>
          <p className="font-extrabold mt-1" style={{ fontFamily: "Fraunces, Georgia, serif" }}>{basics.name}</p>
          <p className="text-[#666]">{basics.title}</p>
        </main>
      </div>
    </div>
  );
}

function SlaterH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-[10px] tracking-[0.3em] font-bold mb-2 ${className}`} style={{ color: "#b9836f" }}>{(children as string).toUpperCase()}</h2>;
}

/* ============== WATSON (Blue sidebar professional) ============== */
export function WatsonTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects } = data;
  const langs = data.languages ?? [];
  const BLUE = "#3b4cb6";
  const BLUE_SOFT = "#a7b1e8";
  return (
    <div className="bg-white text-[#1a1a1a] grid grid-cols-[34%_66%] text-[10.5px] leading-[1.55]" style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1160 }}>
      {/* Sidebar */}
      <aside className="text-white p-7" style={{ background: BLUE }}>
        <div className="flex justify-center mt-2 mb-6">
          <div className="w-32 h-32 rounded-full bg-white border-4 border-white/70 overflow-hidden">
            {isValidPhoto(basics.photo) ? <img src={basics.photo} alt={basics.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/30" />}
          </div>
        </div>

        <WatsonH>Contact</WatsonH>
        <div className="space-y-1.5 text-white/90 text-[10px]">
          {basics.email && <p>✉  {basics.email}</p>}
          {basics.phone && <p>☎  {basics.phone}</p>}
          {basics.location && <p>📍 {basics.location}</p>}
          {basics.website && <p>🔗 {basics.website}</p>}
        </div>

        {skills.length > 0 && (
          <>
            <WatsonH className="mt-6">Skills</WatsonH>
            <ul className="space-y-2.5">
              {skills.map((s, i) => {
                const lvl = 60 + ((i * 17) % 35);
                return (
                  <li key={i}>
                    <p className="text-[10px] mb-1">{s}</p>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BLUE_SOFT }}>
                      <div className="h-full bg-white" style={{ width: `${lvl}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {data.hobbies && data.hobbies.length > 0 && (
          <>
            <WatsonH className="mt-6">Hobbies</WatsonH>
            <p className="text-[10px] text-white/90">{data.hobbies.join(", ")}</p>
          </>
        )}

        {langs.length > 0 && (
          <>
            <WatsonH className="mt-6">Languages</WatsonH>
            <ul className="space-y-1.5">
              {langs.map((l, i) => (
                <li key={i} className="flex items-center justify-between text-[10px]">
                  <span>{l}</span>
                  <span className="flex gap-1">
                    {[0,1,2,3,4].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: d < 4 ? "#fff" : BLUE_SOFT }} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      {/* Main */}
      <main className="p-8">
        <div className="px-5 py-4 mb-5" style={{ background: "#eef0fb" }}>
          <h1 className="text-[28px] font-extrabold leading-none">{(basics.name || "Your Name").toUpperCase()}</h1>
          <div className="h-px w-16 my-2 bg-black/60" />
          <p className="text-[12px] tracking-[0.25em] text-[#555]">{(basics.title || "").toUpperCase()}</p>
        </div>

        {basics.summary && (
          <>
            <WatsonMainH>Summary</WatsonMainH>
            <p className="text-[#222] mb-5">{basics.summary}</p>
          </>
        )}

        {experience.length > 0 && (
          <>
            <WatsonMainH>Experience</WatsonMainH>
            {experience.map((e) => (
              <div key={e.id} className="mb-4 border-l-2 pl-3" style={{ borderColor: BLUE }}>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold">{e.role}</p>
                  <p className="text-[10px] font-bold" style={{ color: BLUE }}>{e.start} - {e.end}</p>
                </div>
                <p className="font-semibold uppercase text-[10px]">{e.company}</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[#222]">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {education.length > 0 && (
          <>
            <WatsonMainH>Education</WatsonMainH>
            {education.map((e) => (
              <div key={e.id} className="mb-2">
                <p className="font-bold">{e.degree}</p>
                <p className="text-[#444]">{e.school} · {e.start}–{e.end}</p>
              </div>
            ))}
          </>
        )}

        {projects.length > 0 && (
          <>
            <WatsonMainH>Projects</WatsonMainH>
            {projects.map((p) => (
              <div key={p.id} className="mb-1.5">
                <p className="font-bold">{p.name}</p>
                <p className="text-[#444]">{p.description}</p>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

function WatsonH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-[14px] font-extrabold tracking-[0.2em] mb-2">{(children as string).toUpperCase()}</h2>
      <div className="h-px bg-white/50 mb-3" />
    </div>
  );
}
function WatsonMainH({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-1">
      <h2 className="text-[16px] font-extrabold tracking-[0.15em]" style={{ color: "#3b4cb6" }}>{(children as string).toUpperCase()}</h2>
      <div className="h-px bg-[#3b4cb6]/30" />
    </div>
  );
}

/* ============== SOPHIA (Yellow sidebar professional) ============== */
export function SophiaTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, interests, strengths, achievements, languages } = data;
  const MUSTARD = "#d9b84a";

  return (
    <div className="bg-white text-[#1a1a1a] grid grid-cols-[65%_35%] text-[10.5px] leading-[1.5]" style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 1160 }}>
      {/* Left Column */}
      <main className="p-10 pr-6">
        <header className="mb-8">
          <h1 className="text-[42px] font-extrabold leading-none mb-1">{basics.name || "SOPHIA BROWN"}</h1>
          <p className="text-[18px] font-medium" style={{ color: MUSTARD }}>{basics.title || "Help Desk"}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-[#555]">
            {basics.email && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
                <span>{basics.email}</span>
              </div>
            )}
            {basics.phone && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{basics.phone}</span>
              </div>
            )}
            {basics.location && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{basics.location}</span>
              </div>
            )}
            {basics.website && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>{basics.website}</span>
              </div>
            )}
          </div>
        </header>

        <SophiaSection icon="user" title="Professional Summary">
          <p className="text-[#333] leading-relaxed">{basics.summary}</p>
        </SophiaSection>

        {experience.length > 0 && (
          <SophiaSection icon="briefcase" title="Work Experience">
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-[12px]">{exp.role}</h3>
                      <p className="text-[11px] font-medium" style={{ color: MUSTARD }}>{exp.company}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#666]">
                      <div className="flex items-center gap-1 justify-end">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>{exp.start} - {exp.end}</span>
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ul className="list-decimal pl-4 mt-2 space-y-1 text-[#333]">
                    {exp.bullets.filter(Boolean).map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SophiaSection>
        )}

        {education.length > 0 && (
          <SophiaSection icon="graduation-cap" title="Education">
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-[11px]">{edu.degree}</h3>
                      <p className="text-[10px] font-medium" style={{ color: MUSTARD }}>{edu.school}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#666]">
                      <div className="flex items-center gap-1 justify-end">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>{edu.start} - {edu.end}</span>
                      </div>
                    </div>
                  </div>
                  {edu.notes && <p className="text-[10px] text-[#555] mt-1">{edu.notes}</p>}
                </div>
              ))}
            </div>
          </SophiaSection>
        )}
      </main>

      {/* Right Column (Sidebar) */}
      <aside className="p-8 pt-10" style={{ backgroundColor: MUSTARD }}>
        {isValidPhoto(basics.photo) && (
          <div className="mb-10 flex justify-center">
            <img src={basics.photo} alt={basics.name} className="w-40 h-40 object-cover rounded shadow-lg border-2 border-white" />
          </div>
        )}

        <SophiaSidebarSection icon="lightbulb" title="Skills">
          <div className="space-y-3">
            {skills.map((skill, i) => (
              <div key={i}>
                <p className="mb-1 font-medium text-white/90">{skill}</p>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, j) => (
                    <div key={j} className={`h-1 flex-1 rounded-full ${j < 7 ? 'bg-white' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SophiaSidebarSection>

        {data.hobbies && data.hobbies.length > 0 && (
          <SophiaSidebarSection icon="zap" title="Hobbies">
            <div className="flex flex-wrap gap-2 text-white/90 text-[10px]">
              {data.hobbies.join(", ")}
            </div>
          </SophiaSidebarSection>
        )}

        {interests && interests.length > 0 && (
          <SophiaSidebarSection icon="send" title="Interests">
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90">
                   <span className="text-[12px]">●</span>
                   <span className="text-[10px]">{interest.name}</span>
                </div>
              ))}
            </div>
          </SophiaSidebarSection>
        )}

        {strengths && strengths.length > 0 && (
          <SophiaSidebarSection icon="zap" title="Strengths">
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength, i) => (
                <div key={i} className="bg-black/20 px-2.5 py-1 rounded flex items-center gap-1.5 text-white">
                  <span className="text-[10px]">{strength.name}</span>
                </div>
              ))}
            </div>
          </SophiaSidebarSection>
        )}

        {languages && languages.length > 0 && (
          <SophiaSidebarSection icon="languages" title="Languages">
            <div className="flex justify-around">
              {languages.map((lang, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative w-12 h-12 mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/20" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - 0.75)} className="text-white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">75%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/90">{lang}</span>
                </div>
              ))}
            </div>
          </SophiaSidebarSection>
        )}

        {achievements && achievements.length > 0 && (
          <SophiaSidebarSection icon="star" title="Achievements">
             <div className="space-y-3">
               {achievements.map((ach, i) => (
                 <div key={i} className="flex gap-2">
                   <svg className="w-3 h-3 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   <p className="text-white/90 text-[10px] leading-tight">{ach}</p>
                 </div>
               ))}
             </div>
          </SophiaSidebarSection>
        )}
      </aside>
    </div>
  );
}

function SophiaSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const iconPaths: Record<string, React.ReactNode> = {
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    briefcase: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    "graduation-cap": <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#eef0fb] flex items-center justify-center text-[#d9b84a]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {iconPaths[icon]}
          </svg>
        </div>
        <h2 className="text-[14px] font-extrabold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </section>
  );
}

function SophiaSidebarSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const iconPaths: Record<string, React.ReactNode> = {
    lightbulb: <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    zap: <><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></>,
    languages: <><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-4 text-white">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {iconPaths[icon]}
          </svg>
        </div>
        <h2 className="text-[12px] font-extrabold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="h-px bg-white/30 mb-5" />
      {children}
    </section>
  );
}


/* ============== TURQUOISE SIDEBAR (Vibrant Turquoise Two-Column) ============== */
export function TurquoiseTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects, languages } = data;
  
  // Custom fallback achievements if achievements field is empty to populate the gorgeous designs
  const achievementsList = data.achievements && data.achievements.length > 0 
    ? data.achievements 
    : (data.projects && data.projects.length > 0
      ? data.projects.map(p => `${p.name}: ${p.description}`)
      : [
          "Awarded for outstanding performance of the month by XYZ Pvt. Ltd.",
          "Won second prize in national video making competition, 'A day in the life of India' held by XYZ Company.",
          "Won second and third prize for advertising making competition for energy drink 'Tzinga'.",
          "Won third prize in intra college competition at XYZ, Mumbai."
        ]);

  // Fallback skills if empty
  const skillsList = skills && skills.length > 0
    ? skills
    : [
        "Business Strategy", "Finance Control", "Credit Underwriting",
        "Collection", "Recovery", "Audit & Compliance",
        "Account reconciliation", "Customs procedures", "Debtors / Creditors", "Banking"
      ];

  // Helper for left-column headers
  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ marginBottom: "16px", marginTop: "12px" }}>
      <div style={{
        border: "1px solid #b0cdda",
        borderRadius: "4px",
        padding: "6px 24px",
        background: "linear-gradient(180deg, #f0f8ff 0%, #e6f2ff 100%)",
        boxShadow: "0 2px 4px rgba(15,80,100,0.06)",
        display: "inline-block",
        minWidth: "160px",
        textAlign: "center",
        fontWeight: 700,
        color: "#1c6075",
        fontSize: "12px",
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}>
        {title}
      </div>
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "64% 36%",
      background: "white",
      color: "#222",
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      minHeight: "1160px",
      fontSize: "11px",
      lineHeight: "1.5"
    }}>
      {/* Left Column (Main Content) */}
      <main style={{ padding: "40px 30px 40px 40px", background: "white" }}>
        
        {/* Objective */}
        <section style={{ marginBottom: "28px" }}>
          <SectionHeader title="Objective" />
          <p style={{ 
            color: "#333", 
            fontSize: "11px", 
            lineHeight: "1.6", 
            textAlign: "justify",
            fontWeight: 400
          }}>
            {basics.summary || "Analytical & detail oriented Assistant Manager (buying & retail operation). Posses Solid Track record of simultaneously maximize unit volume & profits. Demonstrated expertise in evaluating & implementing trends, Sales, OTB, Markdowns & Seasonal Strategies."}
          </p>
        </section>

        {/* Job Responsibility */}
        {experience && experience.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <SectionHeader title="Job Responsibility" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <p style={{ fontWeight: 700, fontSize: "11.5px", color: "#111", marginBottom: "4px" }}>
                    {idx + 1} &nbsp; {exp.role || "Job Role"} {exp.company && `at ${exp.company}`}
                  </p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "24px", margin: "4px 0 0 0", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {exp.bullets && exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} style={{ color: "#333", fontSize: "10.5px", lineHeight: "1.5" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience (Timeline summary) */}
        {experience && experience.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <SectionHeader title="Experience" />
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {experience.map((exp, idx) => (
                <li key={exp.id || idx} style={{ color: "#333", fontSize: "11px", lineHeight: "1.5" }}>
                  <strong>Working at {exp.company || "XYZ Company"}</strong>
                  {exp.location && `, ${exp.location}`} as <strong>{exp.role}</strong>
                  {(exp.start || exp.end) && ` — From ${exp.start || "N/A"} to ${exp.end || "Present"}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Achievements */}
        <section style={{ marginBottom: "20px" }}>
          <SectionHeader title="Achievement" />
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {achievementsList.map((ach, idx) => (
              <li key={idx} style={{ color: "#333", fontSize: "11px", lineHeight: "1.5" }}>
                {ach}
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* Right Column (Sidebar) */}
      <aside style={{
        background: "#3ba7c4",
        color: "white",
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        
        {/* Photo Box */}
        <div style={{
          width: "160px",
          height: "190px",
          background: "#e2e8f0",
          border: "8px solid white",
          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "1px"
        }}>
          {isValidPhoto(basics.photo) ? (
            <img src={basics.photo} alt={basics.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ color: "#718096", fontSize: "11px", fontWeight: "bold" }}>PHOTO</div>
          )}
        </div>

        {/* Name Tag */}
        <div style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: "2px",
          padding: "8px 20px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
          color: "#1c6075",
          fontWeight: 800,
          fontSize: "14px",
          textAlign: "center",
          marginTop: "16px",
          display: "inline-block",
          width: "90%",
          letterSpacing: "0.03em"
        }}>
          {basics.name || "Saurabh Kumar"}
        </div>

        {/* Sidebar Info Section */}
        <div style={{ width: "100%", marginTop: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Skills */}
          <div>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
              paddingBottom: "4px",
              marginBottom: "8px",
              textTransform: "uppercase"
            }}>
              Skills
            </h3>
            <p style={{ fontSize: "11px", fontWeight: 700, margin: "6px 0 2px 0", color: "rgba(255,255,255,0.85)" }}>
              Professional
            </p>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              {skillsList.map((skill, i) => (
                <li key={i} style={{ fontSize: "11px", color: "#f0f9fa", fontWeight: 500 }}>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Related Skills (or Languages) */}
          {languages && languages.length > 0 && (
            <div>
              <h3 style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "4px",
                marginBottom: "8px",
                textTransform: "uppercase"
              }}>
                Related Skills
              </h3>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                {languages.map((lang, i) => (
                  <li key={i} style={{ fontSize: "11px", color: "#f0f9fa" }}>
                    {lang}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h3 style={{
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: "4px",
                marginBottom: "12px",
                textTransform: "uppercase"
              }}>
                Education
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <p style={{ fontWeight: 700, fontSize: "11px", color: "white", lineHeight: "1.4" }}>
                      {edu.degree || "Degree"}
                    </p>
                    <p style={{ fontSize: "10.5px", color: "#e6f7fa", marginTop: "2px", lineHeight: "1.4" }}>
                      from {edu.school || "School"}
                      {edu.end && ` in ${edu.end}`}
                      {edu.notes && ` with ${edu.notes}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </aside>
    </div>
  );
}


/* ============== SAURABH SIDEBAR (Teal Split Columns with Floating Cards) ============== */
export function SaurabhTemplate({ data }: { data: ResumeData }) {
  const { basics, experience, education, skills, projects, languages } = data;
  
  // Custom fallback achievements if achievements field is empty to populate the gorgeous designs
  const achievementsList = data.achievements && data.achievements.length > 0 
    ? data.achievements 
    : (data.projects && data.projects.length > 0
      ? data.projects.map(p => `${p.name}: ${p.description}`)
      : [
          "Awarded for outstanding performance of the month by XYZ Pvt. Ltd.",
          "Won second prize in national video making competition, 'A day in the life of India' held by XYZ Company.",
          "Won second and third prize for advertising making competition for energy drink 'Tzinga'.",
          "Won third prize in intra college competition at XYZ, Mumbai."
        ]);

  // Fallback skills if empty
  const skillsList = skills && skills.length > 0
    ? skills
    : [
        "Business Strategy", "Finance Control", "Credit Underwriting",
        "Collection", "Recovery", "Audit & Compliance",
        "Account reconciliation", "Customs procedures", "Debtors / Creditors", "Banking"
      ];

  // Helper for left-column headers
  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ marginBottom: "16px", marginTop: "12px" }}>
      <div style={{
        border: "1px solid #b0c8d6",
        borderRadius: "4px",
        padding: "6px 24px",
        background: "linear-gradient(180deg, #e6f2f7 0%, #d0e4f0 100%)",
        boxShadow: "0 2px 4px rgba(15,80,100,0.06)",
        display: "inline-block",
        minWidth: "160px",
        textAlign: "center",
        fontWeight: 700,
        color: "#1c6075",
        fontSize: "12px",
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}>
        {title}
      </div>
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "65% 35%",
      background: "white",
      color: "#222",
      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      minHeight: "1160px",
      fontSize: "11px",
      lineHeight: "1.5"
    }}>
      {/* Left Column (Main Content) */}
      <main style={{ padding: "40px 30px 40px 40px", background: "white" }}>
        
        {/* Objective */}
        <section style={{ marginBottom: "28px" }}>
          <SectionHeader title="Objective" />
          <p style={{ 
            color: "#333", 
            fontSize: "11px", 
            lineHeight: "1.6", 
            textAlign: "justify",
            fontWeight: 400
          }}>
            {basics.summary || "Analytical & detail oriented Assistant Manager (buying & retail operation). Posses Solid Track record of simultaneously maximize unit volume & profits. Demonstrated expertise in evaluating & implementing trends, Sales, OTB, Markdowns & Seasonal Strategies."}
          </p>
        </section>

        {/* Job Responsibility */}
        {experience && experience.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <SectionHeader title="Job Responsibility" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <p style={{ fontWeight: 700, fontSize: "11.5px", color: "#111", marginBottom: "4px" }}>
                    {idx + 1} &nbsp; {exp.role || "Job Role"} {exp.company && `at ${exp.company}`}
                  </p>
                  <ul style={{ listStyleType: "disc", paddingLeft: "24px", margin: "4px 0 0 0", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {exp.bullets && exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} style={{ color: "#333", fontSize: "10.5px", lineHeight: "1.5" }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience (Timeline summary) */}
        {experience && experience.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <SectionHeader title="Experience" />
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {experience.map((exp, idx) => (
                <li key={exp.id || idx} style={{ color: "#333", fontSize: "11px", lineHeight: "1.5" }}>
                  <strong>Working at {exp.company || "XYZ Company"}</strong>
                  {exp.location && `, ${exp.location}`} as <strong>{exp.role}</strong>
                  {(exp.start || exp.end) && ` — From ${exp.start || "N/A"} to ${exp.end || "Present"}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Achievements */}
        <section style={{ marginBottom: "20px" }}>
          <SectionHeader title="Achievement" />
          <ul style={{ listStyleType: "disc", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {achievementsList.map((ach, idx) => (
              <li key={idx} style={{ color: "#333", fontSize: "11px", lineHeight: "1.5" }}>
                {ach}
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* Right Column (Sidebar) */}
      <aside style={{
        background: "#46a2c1",
        color: "#222",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        
        {/* Card 1: Photo & Name */}
        <div style={{
          background: "white",
          border: "1px solid #b0c8d6",
          borderRadius: "8px",
          padding: "20px 16px",
          boxShadow: "0 4px 12px rgba(15,80,100,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          {/* Photo Frame */}
          <div style={{
            width: "140px",
            height: "170px",
            background: "#e6f2f7",
            border: "6px solid white",
            outline: "1px solid #b0c8d6",
            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            marginBottom: "16px"
          }}>
            {basics.photo ? (
              <img src={basics.photo} alt={basics.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ color: "#718096", fontSize: "11px", fontWeight: "bold" }}>PHOTO</div>
            )}
          </div>

          {/* Name Tag */}
          <div style={{
            background: "linear-gradient(180deg, #e6f2f7 0%, #d0e4f0 100%)",
            border: "1px solid #b0c8d6",
            borderRadius: "4px",
            padding: "8px 12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            color: "#1c6075",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            width: "100%",
            letterSpacing: "0.03em",
            textTransform: "uppercase"
          }}>
            {basics.name || "Saurabh Kumar"}
          </div>
          {basics.title && (
            <p style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#555250",
              marginTop: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              {basics.title}
            </p>
          )}
        </div>

        {/* Card 2: Bottom Information Card */}
        <div style={{
          background: "white",
          border: "1px solid #b0c8d6",
          borderRadius: "8px",
          padding: "24px 20px",
          boxShadow: "0 4px 12px rgba(15,80,100,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          
          {/* Contact Details */}
          <div>
            <h3 style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#1c6075",
              letterSpacing: "0.08em",
              borderBottom: "1.5px solid #d0e4f0",
              paddingBottom: "4px",
              marginBottom: "10px",
              textTransform: "uppercase"
            }}>
              Contact Info
            </h3>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {basics.email && (
                <li style={{ fontSize: "10.5px", color: "#333", display: "flex", gap: "6px" }}>
                  <span style={{ color: "#1c6075" }}>✉</span>
                  <span style={{ wordBreak: "break-all" }}>{basics.email}</span>
                </li>
              )}
              {basics.phone && (
                <li style={{ fontSize: "10.5px", color: "#333", display: "flex", gap: "6px" }}>
                  <span style={{ color: "#1c6075" }}>☎</span>
                  <span>{basics.phone}</span>
                </li>
              )}
              {basics.location && (
                <li style={{ fontSize: "10.5px", color: "#333", display: "flex", gap: "6px" }}>
                  <span style={{ color: "#1c6075" }}>📍</span>
                  <span>{basics.location}</span>
                </li>
              )}
              {basics.website && (
                <li style={{ fontSize: "10.5px", color: "#333", display: "flex", gap: "6px" }}>
                  <span style={{ color: "#1c6075" }}>🔗</span>
                  <span style={{ wordBreak: "break-all" }}>{basics.website}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <h3 style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#1c6075",
              letterSpacing: "0.08em",
              borderBottom: "1.5px solid #d0e4f0",
              paddingBottom: "4px",
              marginBottom: "10px",
              textTransform: "uppercase"
            }}>
              Skills
            </h3>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
              {skillsList.slice(0, 8).map((skill, i) => (
                <li key={i} style={{ fontSize: "10.5px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#46a2c1", fontSize: "12px" }}>•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Skills */}
          {skillsList.length > 8 && (
            <div>
              <h3 style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#1c6075",
                letterSpacing: "0.08em",
                borderBottom: "1.5px solid #d0e4f0",
                paddingBottom: "4px",
                marginBottom: "10px",
                textTransform: "uppercase"
              }}>
                Related Skills
              </h3>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                {skillsList.slice(8, 14).map((skill, i) => (
                  <li key={i} style={{ fontSize: "10.5px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#46a2c1", fontSize: "12px" }}>•</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h3 style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#1c6075",
                letterSpacing: "0.08em",
                borderBottom: "1.5px solid #d0e4f0",
                paddingBottom: "4px",
                marginBottom: "10px",
                textTransform: "uppercase"
              }}>
                Languages
              </h3>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                {languages.map((lang, i) => (
                  <li key={i} style={{ fontSize: "10.5px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#46a2c1", fontSize: "12px" }}>•</span>
                    <span>{lang}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h3 style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#1c6075",
                letterSpacing: "0.08em",
                borderBottom: "1.5px solid #d0e4f0",
                paddingBottom: "4px",
                marginBottom: "10px",
                textTransform: "uppercase"
              }}>
                Education
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <p style={{ fontWeight: 700, fontSize: "10.5px", color: "#111", lineHeight: "1.4" }}>
                      {edu.degree || "Degree"}
                    </p>
                    <p style={{ fontSize: "10px", color: "#666", marginTop: "2px", lineHeight: "1.4" }}>
                      from {edu.school || "School"}
                      {edu.end && ` (${edu.end})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </aside>
    </div>
  );
}

export const TEMPLATES = [
  { id: "modern", name: "Modern", component: ModernTemplate },
  { id: "classic", name: "Classic", component: ClassicTemplate },
  { id: "creative", name: "Creative", component: CreativeTemplate },
  { id: "minimal", name: "Minimal", component: MinimalTemplate },
  { id: "designer", name: "Designer", component: DesignerTemplate },
  { id: "avery", name: "Avery", component: AveryTemplate },
  { id: "slater", name: "Slater", component: SlaterTemplate },
  { id: "watson", name: "Watson", component: WatsonTemplate },
  { id: "sophia", name: "Sophia", component: SophiaTemplate },
  { id: "turquoise", name: "Turquoise Sidebar", component: TurquoiseTemplate },
  { id: "saurabh", name: "Saurabh Sidebar", component: SaurabhTemplate },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];

export function ResumePreview({ template, data }: { template: string; data: ResumeData }) {
  const T = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];
  const Comp = T.component;
  return <Comp data={data} />;
}
