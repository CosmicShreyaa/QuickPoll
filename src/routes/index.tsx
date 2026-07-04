import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  Copy,
  Link2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { usePolls } from "@/lib/polls-store";
import { useAuth } from "@/lib/auth-store";
import { formatRelativeTime } from "@/lib/format";
import { useOrigin } from "@/lib/use-origin";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { polls, vote } = usePolls();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string>("");
  const [voted, setVoted] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();

  const active = polls.find((p) => p.id === activeId) ?? polls[0];

  const totals = useMemo(
    () => (active ? active.options.reduce((s, o) => s + o.votes, 0) : 0),
    [active],
  );

  const handleVote = (pollId: string, optId: string) => {
    if (voted[pollId]) return;
    setVoted((v) => ({ ...v, [pollId]: optId }));
    vote(pollId, optId);
  };

  const copyLink = () => {
    if (!active) return;
    const url = `${window.location.origin}/${active.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-hero">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Realtime polls, no accounts, no friction
        </div>
        <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Ask a question. <br />
          <span className="text-gradient">Watch answers roll in.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create a poll in seconds, share a single link, and see live results
          update the moment someone votes — no refresh required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to={user ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
          >
            <Zap className="h-4 w-4" />
            {user ? "Go to dashboard" : "Get started free"}
          </Link>
          <a
            href="#live"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-card"
          >
            See it live
          </a>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* Live results demo */}
        {active && (
          <section
            id="live"
            className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Live results
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {active.voters} voters
              </div>
            </div>

            <h3 className="font-display text-2xl font-bold leading-snug">
              {active.question}
            </h3>
            <div className="mt-1 text-xs text-muted-foreground">
              Created {formatRelativeTime(active.createdAt)}
            </div>

            <div className="mt-6 space-y-3">
              {active.options.map((o) => {
                const pct = totals ? Math.round((o.votes / totals) * 100) : 0;
                const isVoted = voted[active.id] === o.id;
                const leading =
                  o.votes === Math.max(...active.options.map((x) => x.votes)) &&
                  totals > 0;
                return (
                  <button
                    key={o.id}
                    onClick={() => handleVote(active.id, o.id)}
                    disabled={!!voted[active.id]}
                    className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                      isVoted
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/50"
                    } ${voted[active.id] ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                        leading ? "bg-gradient-primary opacity-15" : "bg-primary/10"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`grid h-8 w-8 flex-none place-items-center rounded-lg text-xs font-bold ${
                            isVoted
                              ? "bg-gradient-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {isVoted ? <Check className="h-4 w-4" /> : o.id.toUpperCase()}
                        </div>
                        <div className="truncate font-medium">{o.label}</div>
                      </div>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-xs text-muted-foreground">
                          {o.votes}
                        </span>
                        <span className="w-10 text-right text-sm font-bold">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-2">
              <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-secondary">
                <Link2 className="h-4 w-4" />
              </div>
              <Link
                to="/$pollId"
                params={{ pollId: active.id }}
                className="truncate font-mono text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                {origin.replace(/^https?:\/\//, "")}/{active.id}
              </Link>
              <button
                onClick={copyLink}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition-transform hover:scale-[1.03]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Poll browser */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Currently live
              </div>
              <h2 className="font-display mt-1 text-3xl font-bold">
                Trending polls
              </h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {polls.length} active
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((p) => {
              const t = p.options.reduce((s, o) => s + o.votes, 0);
              const top = [...p.options].sort((a, b) => b.votes - a.votes)[0];
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`group rounded-2xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-primary bg-card shadow-elegant"
                      : "border-border bg-card/70 hover:border-primary/50 hover:shadow-soft"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatRelativeTime(p.createdAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {p.voters}
                    </span>
                  </div>
                  <div className="mt-3 line-clamp-2 font-display text-lg font-semibold leading-snug">
                    {p.question}
                  </div>
                  <div className="mt-4 space-y-2">
                    {p.options.slice(0, 3).map((o) => {
                      const pct = t ? Math.round((o.votes / t) * 100) : 0;
                      return (
                        <div key={o.id}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="truncate text-muted-foreground">
                              {o.label}
                            </span>
                            <span className="tabular-nums font-semibold">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full ${
                                o.id === top.id
                                  ? "bg-gradient-primary"
                                  : "bg-primary/40"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-20">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Why QuickPoll
            </div>
            <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
              Built for the speed of a conversation
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Instant setup",
                body: "Type a question, add options, share. That's it — publish from your dashboard in seconds.",
              },
              {
                icon: BarChart3,
                title: "Realtime results",
                body: "Votes stream in over websockets. Bars animate the second someone taps.",
              },
              {
                icon: Link2,
                title: "One clean link",
                body: "Share a short, memorable URL anywhere — chat, email, or a projector.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur transition-all hover:shadow-soft"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                  <f.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-primary">
            <Zap className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
          </div>
          <span className="font-display font-semibold text-foreground">
            QuickPoll
          </span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
