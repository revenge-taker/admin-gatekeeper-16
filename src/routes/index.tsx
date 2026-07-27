import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { seedAdmin } from "@/lib/admin.functions";
import { ButtonSpinnerLabel } from "@/components/ButtonSpinnerLabel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In | Nexus Portal" },
      {
        name: "description",
        content: "Secure sign-in to the Nexus Portal member area. Enter your email and password to access your account dashboard.",
      },
      { property: "og:title", content: "Sign In | Nexus Portal" },
      {
        property: "og:description",
        content: "Secure sign-in to the Nexus Portal member area.",
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
    <main className="auth-canvas flex min-h-screen items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </span>
          <h1 className="text-2xl font-bold text-card-foreground">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue to your dashboard
          </p>
        </div>

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
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field field-focus"
            />
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
      </div>
    </main>
  );
}
