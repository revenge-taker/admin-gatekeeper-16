import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DevilLogo } from "@/components/DevilLogo";
import { supabase } from "@/integrations/supabase/client";
import { seedAdmin } from "@/lib/admin.functions";
import { ButtonSpinnerLabel } from "@/components/ButtonSpinnerLabel";
import { PasswordField } from "@/components/PasswordField";
import { AuthShell } from "@/components/AuthShell";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In | DEVILLEDGER" },
      {
        name: "description",
        content: "Secure sign-in to the DEVILLEDGER member area. Enter your email and password to access your account dashboard.",
      },
      { property: "og:title", content: "Sign In | DEVILLEDGER" },
      {
        property: "og:description",
        content: "Secure sign-in to the DEVILLEDGER member area.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <AuthShell
      icon={<DevilLogo className="h-6 w-6 text-primary" />}
      eyebrow="DEVILLEDGER"
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
      brandTitle="Your secure workspace, one sign-in away."
      brandCopy="DEVILLEDGER keeps member accounts, roles and access in one calm, controlled place."
      highlights={[
        "Encrypted password authentication",
        "Role-aware access to every page",
        "Accounts issued by your administrator",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="field field-focus"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <PasswordField id="password" value={password} onChange={setPassword} />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
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

