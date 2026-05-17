import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Calendar, FileText, Pencil } from "lucide-react";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileData {
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  resumeCount: number;
  title?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export function UserProfileCard({ profile, onUpdate }: { profile: ProfileData; onUpdate: () => void }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const initials = profile.displayName
    ? profile.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : (profile.email ? profile.email[0].toUpperCase() : "U");

  const formattedDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="profile-hero fade-in relative overflow-hidden group">
        {/* Decorative background elements */}
        <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] bg-[radial-gradient(circle,rgba(232,201,126,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[40%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(201,126,184,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full">
          <div className="avatar-wrap relative shrink-0">
            <Avatar className="h-20 w-20 border-[3px] border-[rgba(232,201,126,0.3)] bg-gradient-accent">
              <AvatarImage src={profile.photoURL} className="object-cover" />
              <AvatarFallback className="bg-transparent text-[#1a1500] font-display text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="avatar-status absolute bottom-1 right-1 w-4 h-4 bg-[#4ade80] border-[2.5px] border-[#1c1c22] rounded-full" />
          </div>

          <div className="profile-info flex-1 text-center sm:text-left">
            <h1 className="font-display text-3xl font-bold tracking-tight mb-0.5 text-text leading-tight">{profile.displayName || "Vogats CV User"}</h1>
            <p className="text-accent text-sm font-black uppercase tracking-widest mb-2 opacity-90">{profile.title || "Career Professional"}</p>
            <div className="profile-meta flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <span className="meta-chip bg-surface/50 text-muted text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 border border-border/50 backdrop-blur-sm">
                <Calendar className="w-3 h-3 text-accent" />
                Since {formattedDate}
              </span>
              <span className="meta-chip bg-surface/50 text-muted text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 border border-border/50 backdrop-blur-sm">
                <FileText className="w-3 h-3 text-accent" />
                {profile.resumeCount} Resumes
              </span>
            </div>
          </div>

          <div className="profile-actions flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto">
            <button 
              className="edit-profile-btn flex items-center gap-2 px-4 py-2 bg-soft hover:bg-border border border-border rounded-xl text-text text-sm transition-all"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentProfile={profile}
        onUpdate={onUpdate}
      />
    </>
  );
}
