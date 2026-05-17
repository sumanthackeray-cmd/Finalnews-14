"use client";

import type { FormData } from "@/app/page";

interface Props {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm placeholder:text-gray-400 transition-all duration-200 focus:border-indigo-400 focus:bg-indigo-50/30 bg-gray-50/50";

const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

export default function CheckoutForm({ formData, onChange }: Props) {
  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...formData, [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Name */}
      <div className="md:col-span-2">
        <label className={labelClass} htmlFor="cf-name">Full Name</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            id="cf-name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={set("name")}
            autoComplete="name"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass} htmlFor="cf-email">Email Address</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="cf-email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={set("email")}
            autoComplete="email"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass} htmlFor="cf-phone">Mobile Number</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">+91</div>
          <input
            id="cf-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={formData.phone}
            onChange={e => onChange({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
            autoComplete="tel"
            className={`${inputClass} pl-12`}
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className={labelClass} htmlFor="cf-amount">Amount (INR)</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</div>
          <input
            id="cf-amount"
            type="number"
            inputMode="decimal"
            min="1"
            placeholder="499"
            value={formData.amount}
            onChange={e => onChange({ ...formData, amount: e.target.value })}
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass} htmlFor="cf-desc">Description (Optional)</label>
        <input
          id="cf-desc"
          type="text"
          placeholder="e.g. Pro Plan Subscription"
          value={formData.description}
          onChange={set("description")}
          className={inputClass}
        />
      </div>
    </div>
  );
}
