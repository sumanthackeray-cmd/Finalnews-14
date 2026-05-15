export type ResumeData = {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    photo?: string;
  };
  experience: Array<{
    id: string;
    company: string;
    role: string;
    location: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    start: string;
    end: string;
    notes: string;
  }>;
  skills: string[];
  projects: Array<{ id: string; name: string; description: string; link: string }>;
  tools?: Array<{ id: string; name: string; level: number }>;
  references?: Array<{ id: string; name: string; role: string; email: string; phone: string }>;
  languages?: string[];
};

export const emptyResume: ResumeData = {
  basics: { name: "", title: "", email: "", phone: "", location: "", website: "", summary: "" },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

export const sampleResume: ResumeData = {
  basics: {
    name: "Alex Morgan",
    title: "Senior Product Designer",
    email: "alex@example.com",
    phone: "+1 555 0100",
    location: "Brooklyn, NY",
    website: "alexmorgan.design",
    summary:
      "Product designer with 8+ years shipping consumer and B2B SaaS at scale. Specializes in design systems, 0→1 product strategy, and partnering closely with engineering.",
  },
  experience: [
    {
      id: "1",
      company: "Linear",
      role: "Senior Product Designer",
      location: "Remote",
      start: "2022",
      end: "Present",
      bullets: [
        "Led redesign of the issue triage flow, lifting weekly active usage 28%.",
        "Built and shipped the new mobile app from concept to launch in 6 months.",
        "Mentored 3 designers; introduced weekly design critiques across the org.",
      ],
    },
    {
      id: "2",
      company: "Stripe",
      role: "Product Designer",
      location: "San Francisco, CA",
      start: "2019",
      end: "2022",
      bullets: [
        "Owned the Connect onboarding experience used by 200k+ businesses.",
        "Reduced KYC drop-off 19% with a redesigned multi-step form.",
      ],
    },
  ],
  education: [
    {
      id: "1",
      school: "RISD",
      degree: "BFA, Graphic Design",
      start: "2013",
      end: "2017",
      notes: "Honors. Thesis: typographic systems for digital products.",
    },
  ],
  skills: ["Figma", "Design Systems", "Prototyping", "User Research", "HTML/CSS", "Motion"],
  projects: [
    { id: "1", name: "Open Type Specimens", description: "Open-source type specimen generator.", link: "github.com/alex/specimens" },
  ],
};
