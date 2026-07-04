import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { usePoll } from "@/lib/polls-store";
import { formatRelativeTime } from "@/lib/format";

export const Route = createFileRoute("/$pollId")({
  component: PollPage,
});

function PollPage() {
  const { pollId } = Route.useParams();
  const { poll, isLoading, isError, vote } = usePoll(pollId);
  const [voted, setVoted] = useState<string | null>(null);

  const totals = poll ? poll.options.reduce((s, o) => s + o.votes, 0) : 0;
  const topVotes = poll ? Math.max(...poll.options.map((o) => o.votes), 0) : 0;

  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    vote(optionId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All polls
        </Link>

        {isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Loading poll…</p>
        )}

        {isError && (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="font-medium">Poll not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This link may be broken or the poll was deleted.
            </p>
          </div>
        )}

        {poll && (
          <section className="mt-8 rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Live results
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {poll.voters} voters
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold leading-snug">
              {poll.question}
            </h1>
            <div className="mt-1 text-xs text-muted-foreground">
              Created {formatRelativeTime(poll.createdAt)}
            </div>

            <div className="mt-6 space-y-3">
              {poll.options.map((o) => {
                const pct = totals ? Math.round((o.votes / totals) * 100) : 0;
                const isVoted = voted === o.id;
                const leading = totals > 0 && o.votes === topVotes;
                return (
                  <button
                    key={o.id}
                    onClick={() => handleVote(o.id)}
                    disabled={!!voted}
                    className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                      isVoted
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/50"
                    } ${voted ? "cursor-default" : "cursor-pointer"}`}
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
          </section>
        )}
      </main>
    </div>
  );
}
