import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type PlanId = "STARTER" | "PRO" | "UNLIMITED";

export const PLANS = {
  STARTER: {
    id: "STARTER",
    price: 49,
    label: "Starter",
    durationDays: 3,
    resumeLimit: 10,
    unlimited: false,
    color: "oklch(0.7 0.2 60)", // Amber
    badge: "Quick Access",
    perks: ["3 days validity", "10 resumes created", "PDF + Word downloads", "AI-powered content", "5 professional templates", "ATS-optimized format"],
  },
  PRO: {
    id: "PRO",
    price: 149,
    label: "Professional",
    durationDays: 15,
    resumeLimit: 49,
    unlimited: false,
    color: "oklch(0.6 0.2 260)", // Indigo
    badge: "Most Popular",
    perks: ["15 days validity", "49 resumes created", "PDF + Word downloads", "AI-powered content", "20+ premium templates", "Cover letter builder", "LinkedIn profile optimizer", "Priority AI generation"],
  },
  UNLIMITED: {
    id: "UNLIMITED",
    price: 999,
    label: "Unlimited",
    durationDays: 60,
    resumeLimit: Infinity,
    unlimited: true,
    color: "oklch(0.65 0.15 160)", // Emerald
    badge: "Best Value",
    perks: ["60 days validity", "Unlimited resumes", "PDF + Word downloads", "AI-powered content", "All 50+ templates", "Cover letter builder", "LinkedIn profile optimizer", "24/7 Priority support", "Interview prep toolkit"],
  },
};

export interface Subscription {
  planId: PlanId;
  paymentId: string;
  paidAmount: number;
  activatedAt: string;
  expiresAt: string;
  resumesUsed: number;
  resumeLimit: number;
  unlimited: boolean;
  status: "ACTIVE" | "EXPIRED";
}

export function createSubscription(planId: PlanId, paymentId: string): Subscription {
  const plan = PLANS[planId];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  
  return {
    planId,
    paymentId,
    paidAmount: plan.price,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    resumesUsed: 0,
    resumeLimit: plan.resumeLimit,
    unlimited: plan.unlimited,
    status: "ACTIVE",
  };
}

export function checkAccess(subscription: Subscription | null) {
  if (!subscription) return { allowed: false, reason: "No active subscription" };
  const now = new Date();
  const expires = new Date(subscription.expiresAt);
  if (now > expires) return { allowed: false, reason: "Subscription expired" };
  if (!subscription.unlimited && subscription.resumesUsed >= subscription.resumeLimit)
    return { allowed: false, reason: `Resume limit reached (${subscription.resumeLimit}/${subscription.resumeLimit})` };
  return { allowed: true, reason: "Access granted" };
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const docSnap = await getDoc(doc(db, "subscriptions", userId));
  if (docSnap.exists()) {
    const sub = docSnap.data() as Subscription;
    // Check for expiry on the fly
    if (new Date() > new Date(sub.expiresAt) && sub.status === "ACTIVE") {
        await updateDoc(doc(db, "subscriptions", userId), { status: "EXPIRED" });
        return { ...sub, status: "EXPIRED" };
    }
    return sub;
  }
  return null;
}

export async function saveSubscription(userId: string, sub: Subscription) {
  await setDoc(doc(db, "subscriptions", userId), sub);
}

export async function incrementResumeUsage(userId: string) {
    const sub = await getUserSubscription(userId);
    if (!sub || sub.status !== "ACTIVE") return false;
    await updateDoc(doc(db, "subscriptions", userId), {
        resumesUsed: sub.resumesUsed + 1
    });
    return true;
}
