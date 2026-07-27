import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { seedAdmin } from "@/lib/admin.functions";
import { ButtonSpinnerLabel } from "@/components/ButtonSpinnerLabel";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administrator Access | Nexus Portal" },
      {
        name: "description",
        content: "Restricted administrator sign-in for the Nexus Portal control panel.",
      },
      { property: "og:title", content: "Administrator Access | Nexus Portal" },
      {
        property: "og:description",
        content: "Restricted administrator sign-in for the Nexus Portal control panel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    seedAdmin({ data: undefined }).catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !data.user) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Access Denied - Admins Only");
      return;
    }

    navigate({ to: "/admin/dashboard", replace: true });
  };

  return (
    <AuthShell
      icon={<ShieldCheck className="h-6 w-6 text-primary" />}
      eyebrow="Restricted area"
      title="Administrator access"
      subtitle="Authorised personnel only"
      brandTitle="Control the portal from a single console."
      brandCopy="Sign in with an administrator account to manage members, roles and portal activity."
      highlights={[
        "Admin-only credential check",
        "Create and remove member accounts",
        "Live portal statistics",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@admin.com"
            className="field field-focus"
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <PasswordField id="admin-password" value={password} onChange={setPassword} />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <ButtonSpinnerLabel loading={loading} />
        </button>
      </form>
    </AuthShell>
  );
}

