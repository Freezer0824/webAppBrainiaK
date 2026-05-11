import { useState } from "react";
import { register } from "@/lib/api/auth-api";
import { useAuthStore } from "@/store/auth-store";

export function RegisterForm() {
  const { loginSuccess, setAuthView } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      loginSuccess({
        token: result.access_token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-2)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:p-10">
      <h3 className="heading-brainiak mb-3 text-3xl text-white">
        Créer un compte
      </h3>

      <p className="text-secondary mb-8 text-base leading-8">
        Créez votre identité Brainiak pour retrouver vos conversations et votre
        environnement de travail.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-white outline-none placeholder:text-[var(--text-secondary)]"
        />

        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-white outline-none placeholder:text-[var(--text-secondary)]"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-white outline-none placeholder:text-[var(--text-secondary)]"
        />

        {error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-gradient-to-r from-[#4DA3FF] to-[#22D3EE] px-5 py-4 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Création..." : "Créer un compte"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setAuthView("login")}
        className="mt-5 w-full text-sm text-cyan-300 transition hover:text-cyan-200"
      >
        J’ai déjà un compte
      </button>

      <button
        type="button"
        onClick={() => setAuthView("welcome")}
        className="mt-2 w-full text-sm text-[var(--text-secondary)]"
      >
        Retour
      </button>
    </div>
  );
}