import { Link, useRouterState } from "@tanstack/react-router";
import { Zap, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-store";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const linkCls = (to: string) =>
    `transition-colors ${pathname === to ? "text-foreground" : "hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
            <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="font-display text-xl font-bold tracking-tight">
            QuickPoll
          </div>
          <span className="ml-2 hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Live
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className={linkCls("/")}>
            Home
          </Link>
          {user && (
            <Link to="/dashboard" className={linkCls("/dashboard")}>
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                {user.name}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-2 text-sm font-semibold transition-colors hover:bg-card"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="hidden rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-card sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
