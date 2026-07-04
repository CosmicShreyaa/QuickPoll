import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { signIn } from "@/lib/auth-store";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-elegant">
            <Zap className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to publish and manage your polls.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8"
        >
          <label className="block text-sm font-medium">Email</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full bg-transparent py-3 text-base outline-none"
            />
          </div>

          <label className="mt-5 block text-sm font-medium">Password</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent py-3 text-base outline-none"
            />
          </div>

          {error && (
            <p className="mt-4 text-center text-sm font-medium text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/sign-up" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
