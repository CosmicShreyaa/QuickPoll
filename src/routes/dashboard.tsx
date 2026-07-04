import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useOrigin } from "@/lib/use-origin";
import {
  BarChart3,
  Check,
  Copy,
  Link2,
  Plus,
  Trash2,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-store";
import { usePolls, type Poll } from "@/lib/polls-store";
import { formatRelativeTime } from "@/lib/format";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { polls, createPoll, deletePoll } = usePolls();

  useEffect(() => {
    if (user === null) {
      // wait a tick for hydration
      const t = setTimeout(() => {
        if (!localStorage.getItem("quickpoll_user")) {
          navigate({ to: "/sign-in" });
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  const myPolls = useMemo(
    () => (user ? polls.filter((p) => p.owner === user.email) : []),
    [polls, user],
  );

  const [question, setQuestion] = useState("");
  const [drafts, setDrafts] = useState<string[]>(["", ""]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const addDraft = () => setDrafts((d) => [...d, ""]);
  const removeDraft = (i: number) =>
    setDrafts((d) => (d.length <= 2 ? d : d.filter((_, idx) => idx !== i)));

  const publish = async () => {
    const opts = drafts.map((d) => d.trim()).filter(Boolean);
    if (!user || !question.trim() || opts.length < 2) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await createPoll(question.trim(), opts);
      setQuestion("");
      setDrafts(["", ""]);
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : "Failed to publish poll");
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/${id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground bg-gradient-hero">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const totalVotes = myPolls.reduce(
    (s, p) => s + p.options.reduce((a, o) => a + o.votes, 0),
    0,
  );
  const totalVoters = myPolls.reduce((s, p) => s + p.voters, 0);

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-hero">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Dashboard
            </div>
            <h1 className="font-display mt-1 text-4xl font-bold tracking-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish new polls and watch results roll in.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={BarChart3}
            label="Polls published"
            value={myPolls.length}
          />
          <StatCard icon={Users} label="Total voters" value={totalVoters} />
          <StatCard icon={TrendingUp} label="Total votes" value={totalVotes} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Create */}
          <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Publish
                </div>
                <h2 className="font-display mt-1 text-2xl font-bold">
                  New poll
                </h2>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <label className="block text-sm font-medium">Your question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Where should we order lunch from?"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30"
            />

            <div className="mt-5 space-y-3">
              <div className="text-sm font-medium">Options</div>
              {drafts.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    value={d}
                    onChange={(e) =>
                      setDrafts((arr) =>
                        arr.map((v, idx) => (idx === i ? e.target.value : v)),
                      )
                    }
                    placeholder={`Option ${i + 1}`}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    onClick={() => removeDraft(i)}
                    disabled={drafts.length <= 2}
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addDraft}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80"
              >
                <Plus className="h-4 w-4" />
                Add option
              </button>
            </div>

            {publishError && (
              <p className="mt-4 text-sm font-medium text-destructive">{publishError}</p>
            )}

            <button
              onClick={publish}
              disabled={publishing}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              {publishing ? "Publishing…" : "Publish poll"}
            </button>
          </section>

          {/* My polls */}
          <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Live results
                </div>
                <h2 className="font-display mt-1 text-2xl font-bold">
                  Your polls
                </h2>
              </div>
              <div className="text-xs text-muted-foreground">
                {myPolls.length} total
              </div>
            </div>

            {myPolls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background/60 p-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-secondary">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">No polls yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publish your first poll on the left and see results here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {myPolls.map((p) => (
                  <MyPollCard
                    key={p.id}
                    poll={p}
                    copied={copiedId === p.id}
                    onCopy={() => copyLink(p.id)}
                    onDelete={() => deletePoll(p.id)}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Want to see what's trending?{" "}
              <Link to="/" className="font-semibold text-primary hover:underline">
                Browse public polls
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function MyPollCard({
  poll,
  copied,
  onCopy,
  onDelete,
}: {
  poll: Poll;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const origin = useOrigin();
  const totals = poll.options.reduce((s, o) => s + o.votes, 0);
  const topVotes = Math.max(...poll.options.map((o) => o.votes), 0);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatRelativeTime(poll.createdAt)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {poll.voters} voters
            </span>
          </div>
          <h3 className="font-display mt-1 text-lg font-semibold leading-snug">
            {poll.question}
          </h3>
        </div>
        <button
          onClick={onDelete}
          className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          aria-label="Delete poll"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {poll.options.map((o) => {
          const pct = totals ? Math.round((o.votes / totals) * 100) : 0;
          const leading = totals > 0 && o.votes === topVotes;
          return (
            <div key={o.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="truncate font-medium">{o.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {o.votes} · <span className="font-bold text-foreground">{pct}%</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    leading ? "bg-gradient-primary" : "bg-primary/40"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border bg-card/60 p-2">
        <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-secondary">
          <Link2 className="h-4 w-4" />
        </div>
        <Link
          to="/$pollId"
          params={{ pollId: poll.id }}
          className="truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {origin.replace(/^https?:\/\//, "")}/{poll.id}
        </Link>
        <button
          onClick={onCopy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-transform hover:scale-[1.03]"
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
    </div>
  );
}
