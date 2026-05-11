import {
  Brain,
  FileText,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import logoBrainiak from "@/assets/logo-brainiak.png";

export function AuthScreen() {
  const { authView, setAuthView, continueAsGuest } = useAuthStore();

  return (
    <main className="bg-brainiak h-screen overflow-y-auto">
      <div className="mx-auto min-h-full w-full max-w-[1800px] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div className="min-h-[calc(100vh-24px)] rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:min-h-[calc(100vh-32px)] lg:min-h-[calc(100vh-48px)]">
          <div className="grid min-h-full grid-cols-1 2xl:grid-cols-[1.3fr_0.7fr]">
            <section className="relative overflow-hidden border-b border-[var(--border)] bg-[radial-gradient(circle_at_top_left,rgba(77,163,255,0.2),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.14),transparent_20%),linear-gradient(180deg,#0b1222_0%,#09101b_40%,#0a0f1a_100%)] p-6 sm:p-8 lg:p-10 xl:p-12 2xl:border-b-0 2xl:border-r 2xl:p-16">
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute left-[-10%] top-[-8%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute bottom-[8%] right-[4%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute left-[18%] top-[24%] h-px w-[42%] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
                <div className="absolute left-[40%] top-[52%] h-px w-[28%] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-8 flex items-center gap-4 sm:mb-10">
                  <img
                    src={logoBrainiak}
                    alt="Brainiak"
                    className="h-14 w-14 rounded-2xl object-cover shadow-[0_0_24px_rgba(77,163,255,0.18)] sm:h-16 sm:w-16"
                  />
                  <div className="min-w-0">
                    <h1 className="heading-brainiak text-3xl text-white sm:text-4xl">
                      Brainiak
                    </h1>
                    <p className="text-secondary text-sm sm:text-base">
                      Control Console Brainiak nouvelle génération
                    </p>
                  </div>
                </div>

                <div className="max-w-5xl">
                  <p className="mb-4 text-xs uppercase tracking-[0.24em] text-cyan-300/80 sm:text-sm">
                    Bienvenue dans l’environnement Brainiak
                  </p>

                  <h2 className="heading-brainiak max-w-5xl text-4xl leading-tight text-white sm:text-5xl xl:text-6xl">
                    Une interface pensée pour raisonner, orchestrer, analyser et
                    travailler sur des contextes riches.
                  </h2>

                  <p className="text-secondary mt-5 max-w-3xl text-base leading-8 lg:text-lg">
                    Brainiak propose une expérience de type Copilot orientée
                    exécution agentique, contexte documentaire, visualisation des
                    étapes, observabilité, raisonnement structuré et travail
                    assisté par outils.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <Brain className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Raisonnement structuré
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Réponses plus profondes, étapes logiques, décomposition
                      analytique et rendu structuré.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Contexte documentaire
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Exploitation de pièces jointes, fichiers projet, résumés et
                      injections de contexte dans le pipeline.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Recherche et outils
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Web search, analyse, code, outils spécialisés et presets
                      Brainiak exploitables depuis le composer.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Orchestration agentique
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Visualisation des phases d’exécution, chronologie runtime et
                      activité du pipeline en temps réel.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <Network className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Observabilité Brainiak
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Latence, nombre d’outils utilisés, signaux, logs et mémoire
                      visible pour comprendre le comportement du système.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Session continue
                    </p>
                    <p className="text-secondary mt-2 text-sm leading-7">
                      Conversations persistées, contexte actif, mémoire de
                      session et retour rapide sur vos travaux précédents.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-1 2xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(20,28,46,0.82),rgba(10,15,26,0.92))] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Expérience Brainiak
                        </p>
                        <p className="text-secondary text-sm">
                          Vue d’ensemble de la logique produit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm leading-7 text-[var(--text-primary)]">
                      <p>
                        <span className="text-cyan-300">1.</span> Un espace de
                        travail centré sur les conversations, les outils, la
                        mémoire visible et les signaux d’exécution.
                      </p>
                      <p>
                        <span className="text-cyan-300">2.</span> Une capacité à
                        enrichir les prompts avec des fichiers, des recherches,
                        des presets et des modes de raisonnement.
                      </p>
                      <p>
                        <span className="text-cyan-300">3.</span> Une interface
                        conçue pour un futur multi-utilisateur, avec comptes,
                        sessions invitées et continuité des travaux.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(10,15,26,0.85),rgba(20,28,46,0.92))] p-6">
                    <p className="mb-4 text-sm uppercase tracking-[0.18em] text-cyan-300/80">
                      Brainiak at a glance
                    </p>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          Workspace
                        </span>
                        <span className="text-sm font-medium text-white">
                          Copilot-first
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          Runtime
                        </span>
                        <span className="text-sm font-medium text-white">
                          Observable
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          Reasoning
                        </span>
                        <span className="text-sm font-medium text-white">
                          Structured
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          Attachments
                        </span>
                        <span className="text-sm font-medium text-white">
                          Context-aware
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3">
                        <span className="text-sm text-[var(--text-secondary)]">
                          Identity
                        </span>
                        <span className="text-sm font-medium text-white">
                          Guest / Account
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex items-start justify-center p-6 sm:p-8 lg:p-10 xl:p-12 2xl:bg-[linear-gradient(180deg,rgba(12,18,31,0.96),rgba(15,22,36,0.98))]">
              <div className="w-full max-w-lg 2xl:sticky 2xl:top-10">
                {authView === "welcome" && (
                  <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-2)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:p-10">
                    <h3 className="heading-brainiak mb-3 text-3xl text-white">
                      Bienvenue sur Brainiak
                    </h3>
                    <p className="text-secondary mb-8 text-base leading-8">
                      Choisissez comment vous souhaitez entrer dans l’espace
                      Brainiak. Vous pouvez commencer immédiatement en invité ou
                      accéder à une expérience persistée avec un compte.
                    </p>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={continueAsGuest}
                        className="w-full rounded-2xl bg-gradient-to-r from-[#4DA3FF] to-[#22D3EE] px-5 py-4 text-sm font-semibold text-black transition hover:opacity-90"
                      >
                        Continuer en invité
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthView("login")}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 text-sm font-medium text-white transition hover:border-cyan-400/40"
                      >
                        Se connecter
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthView("register")}
                        className="w-full text-sm text-cyan-300 transition hover:text-cyan-200"
                      >
                        Créer un compte
                      </button>
                    </div>

                    <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
                      <p className="text-sm font-medium text-white">
                        Accès invité
                      </p>
                      <p className="text-secondary mt-2 text-sm leading-7">
                        Parfait pour découvrir Brainiak rapidement. Vous pourrez
                        vous connecter plus tard depuis l’interface.
                      </p>
                    </div>
                  </div>
                )}

                {authView === "login" && <LoginForm />}
                {authView === "register" && <RegisterForm />}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}