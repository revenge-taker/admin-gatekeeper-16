import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Lock, Save, UserCog } from "lucide-react";
import { getMyProfile, updateMyProfile } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { PasswordField } from "@/components/PasswordField";

export function ProfileSettings() {
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile({ data: undefined }),
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveProfile({ data: { name: name.trim(), phone: phone.trim() } });
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setMessage({ kind: "ok", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not update profile" });
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (password.length < 6) {
      setPwMessage({ kind: "err", text: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirm) {
      setPwMessage({ kind: "err", text: "Passwords do not match." });
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwSaving(false);
    if (error) {
      setPwMessage({ kind: "err", text: error.message });
      return;
    }
    setPassword("");
    setConfirm("");
    setPwMessage({ kind: "ok", text: "Password changed successfully." });
  };

  const initials =
    (profile?.name || profile?.email || "?")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="panel p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 font-display text-lg font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold">{profile?.name || "Your profile"}</p>
            <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {profile?.role ?? "—"}
          </span>
        </div>

        <form onSubmit={submitProfile} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Full name
            </label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phone
            </label>
            <input
              className="field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input className="field opacity-60" value={profile?.email ?? ""} disabled />
            <p className="mt-1 text-xs text-muted-foreground">Email is managed by an administrator.</p>
          </div>

          {message && (
            <p className={`text-sm ${message.kind === "ok" ? "text-emerald-400" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> Save changes
              </span>
            )}
          </button>
        </form>
      </section>

      <section className="panel p-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Change password</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 6 characters. You stay signed in after changing it.
        </p>

        <form onSubmit={submitPassword} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New password
            </label>
            <PasswordField id="new-password" value={password} onChange={setPassword} placeholder="New password" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confirm password
            </label>
            <PasswordField id="confirm-password" value={confirm} onChange={setConfirm} placeholder="Repeat password" />
          </div>

          {pwMessage && (
            <p className={`text-sm ${pwMessage.kind === "ok" ? "text-emerald-400" : "text-destructive"}`}>
              {pwMessage.text}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pwSaving}>
            {pwSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserCog className="h-4 w-4" /> Update password
              </span>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
