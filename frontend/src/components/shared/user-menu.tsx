import { useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const openLogin = useAuthStore((state) => state.openLogin);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isGuest = user?.mode === "guest";
  const isAuthenticatedUser = user?.mode === "authenticated";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user || isGuest) {
    return (
      <div className="border-t border-[var(--border)] p-4">
        <button
          type="button"
          onClick={openLogin}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-cyan-400/40 hover:text-cyan-300"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (!isAuthenticatedUser) return null;

  return (
    <div ref={containerRef} className="relative border-t border-[var(--border)] p-4">
      {open && (
        <div className="absolute bottom-[72px] left-4 right-4 z-30 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface-2)]"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-left transition",
          open && "border-cyan-400/40",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
            <UserCircle2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {user.email ?? "Compte Brainiak"}
            </p>
          </div>
        </div>

        <ChevronUp
          className={cn(
            "h-4 w-4 text-[var(--text-secondary)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}