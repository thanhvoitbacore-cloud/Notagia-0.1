"use client";

import { useState, useTransition } from "react";
import { updateProfile, changePassword } from "@/app/actions/settings";
import { Save, KeyRound, User, Mail, ShieldCheck, Loader2 } from "lucide-react";

export function SettingsForm({ user }: { user: { name: string | null; email: string } }) {
  const [profileMessage, setProfileMessage] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPwd, startPwdTransition] = useTransition();

  const handleProfileUpdate = (formData: FormData) => {
    startProfileTransition(async () => {
      try {
        await updateProfile(formData);
        setProfileMessage("Profile updated successfully!");
        setTimeout(() => setProfileMessage(""), 3000);
      } catch (e: any) {
        setProfileMessage("Error updating profile.");
      }
    });
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwdMessage("Password must be at least 8 characters.");
      return;
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(generated);
    setIsOtpSent(true);
    setPwdMessage("");
    // Simulate toast
    alert(`MOCK OTP: ${generated}\n(This simulates an email/SMS OTP)`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue !== mockOtp) {
      setPwdMessage("Invalid OTP code. Please try again.");
      return;
    }

    startPwdTransition(async () => {
      const formData = new FormData();
      formData.append("newPassword", newPassword);
      
      try {
        await changePassword(formData);
        setPwdMessage("Password changed securely!");
        setIsOtpSent(false);
        setNewPassword("");
        setOtpValue("");
        setTimeout(() => setPwdMessage(""), 4000);
      } catch {
        setPwdMessage("Failed to change password.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Profile Section */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-zinc-400" />
          Public Profile
        </h2>
        
        <form action={handleProfileUpdate} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email Address</label>
            <div className="flex bg-black/40 rounded-xl px-4 py-3 border border-white/5 items-center gap-3">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-500 text-sm cursor-not-allowed select-none">{user.email}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Your email address cannot be changed right now.</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name || ""}
              placeholder="e.g. John Doe"
              className="w-full bg-black/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-emerald-400 text-sm font-medium">{profileMessage}</span>
            <button
              type="submit"
              disabled={isPendingProfile}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isPendingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Security Section (Mock OTP) */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-zinc-400" />
          Security
        </h2>

        {!isOtpSent ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-black/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 border border-white/10 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-red-400 text-sm font-medium">{pwdMessage}</span>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Request OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-2">
              <p className="text-sm text-indigo-200">
                We've sent a 6-digit confirmation code to <strong className="text-indigo-100">{user.email}</strong>. 
                Please enter it below to confirm your password change.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Verification Code</label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-black/40 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 border border-white/10 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className={`text-sm font-medium ${pwdMessage.includes("securely") ? "text-emerald-400" : "text-red-400"}`}>
                {pwdMessage}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsOtpSent(false); setPwdMessage(""); }}
                  className="text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPendingPwd}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPendingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isPendingPwd ? "Verifying..." : "Verify & Change"}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
