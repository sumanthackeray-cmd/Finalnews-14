import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Camera, X, User, Briefcase, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  displayName: string;
  email: string;
  photoURL?: string;
  title?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  currentProfile,
  onUpdate
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentProfile: ProfileData;
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: currentProfile.displayName || "",
    email: currentProfile.email || "",
    photoURL: currentProfile.photoURL || "",
    title: currentProfile.title || "",
    phone: currentProfile.phone || "",
    location: currentProfile.location || "",
    linkedin: currentProfile.linkedin || "",
    github: currentProfile.github || "",
  });

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        displayName: currentProfile.displayName || "",
        email: currentProfile.email || "",
        photoURL: currentProfile.photoURL || "",
        title: currentProfile.title || "",
        phone: currentProfile.phone || "",
        location: currentProfile.location || "",
        linkedin: currentProfile.linkedin || "",
        github: currentProfile.github || "",
      });
    }
  }, [isOpen, currentProfile]);

  const save = async () => {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      toast.success("Profile updated successfully!");
      onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }
    const r = new FileReader();
    r.onload = () => setFormData(prev => ({ ...prev, photoURL: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-border p-6 flex items-center justify-between">
          <DialogTitle className="font-display text-2xl font-black text-text">Edit Profile</DialogTitle>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full text-muted transition-colors sm:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative w-28 h-28 rounded-[2rem] bg-surface border-2 border-dashed border-border hover:border-accent flex items-center justify-center cursor-pointer overflow-hidden transition-all group shadow-inner"
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              {formData.photoURL ? (
                <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted group-hover:text-accent">
                  <Camera className="h-8 w-8" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                </div>
              )}
              <div className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                <span className="text-[10px] text-white font-black uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform">Change Photo</span>
              </div>
            </div>
            <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <div className="text-center">
              <h4 className="text-sm font-bold text-text">Profile Picture</h4>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">PNG, JPG or WEBP (Max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-6 md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="w-4 h-4 text-accent" />
                <h5 className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">Personal Information</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">Full Name</Label>
                  <Input 
                    value={formData.displayName} 
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} 
                    className="h-12 bg-surface border-border rounded-xl focus:ring-accent"
                    placeholder="e.g. Suman Thackeray"
                  />
                </div>
                <div className="space-y-1.5 opacity-60">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">Email Address</Label>
                  <Input value={formData.email} disabled className="h-12 bg-muted/20 border-border rounded-xl cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-muted uppercase tracking-widest">Professional Headline</Label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    className="h-12 bg-surface border-border rounded-xl pl-11"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 md:col-span-2 mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Phone className="w-4 h-4 text-accent" />
                <h5 className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">Contact & Location</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">Phone Number</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="h-12 bg-surface border-border rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                      className="h-12 bg-surface border-border rounded-xl pl-11"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-6 md:col-span-2 mt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Globe className="w-4 h-4 text-accent" />
                <h5 className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">Social Profiles</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">LinkedIn URL</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0077b5]" />
                    <Input 
                      value={formData.linkedin} 
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} 
                      className="h-12 bg-surface border-border rounded-xl pl-11"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest">GitHub URL</Label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text" />
                    <Input 
                      value={formData.github} 
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })} 
                      className="h-12 bg-surface border-border rounded-xl pl-11"
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 z-20">
          <Button variant="ghost" onClick={onClose} disabled={busy} className="flex-1 h-12 bg-surface border border-border text-text hover:bg-border rounded-xl font-bold uppercase text-[10px] tracking-widest">
            Cancel
          </Button>
          <Button onClick={save} disabled={busy} className="flex-[2] h-12 btn-premium rounded-xl shadow-xl shadow-accent/20">
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Save Profile Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
