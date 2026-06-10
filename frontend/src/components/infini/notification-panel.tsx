import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useActivityStore } from "@/store/activity-store";
import { useValidationStore } from "@/store/validation-store";
import { useWorkflowStore } from "@/store/workflow-store";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationPanel() {
  const activities = useActivityStore((state) => state.activities);
  const validations = useValidationStore((state) => state.validations);
  const tasks = useWorkflowStore((state) => state.tasks);

  const runningTasks = tasks.filter((task) => task.status === "running");
  const errorTasks = tasks.filter((task) => task.status === "error");
  const pendingValidations = validations.filter(
    (validation) => validation.status === "en attente",
  );

  const recentActivities = activities.slice(0, 20);

  return (
    <div className="absolute right-0 top-12 z-50 w-[420px] rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-300" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Notifications
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Activités BrainiaK et validations
            </p>
          </div>
        </div>
      </div>

      <div className="scrollbar-brainiak max-h-[72vh] overflow-y-auto p-4">
        <div className="space-y-4">
          {runningTasks.length > 0 ? (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                En cours
              </p>

              <div className="space-y-2">
                {runningTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-cyan-300" />

                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {task.description ?? "Traitement BrainiaK en cours"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {pendingValidations.length > 0 ? (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                Validations en attente
              </p>

              <div className="space-y-2">
                {pendingValidations.map((validation) => (
                  <div
                    key={validation.id}
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-amber-300" />

                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {validation.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {validation.type} · risque {validation.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {errorTasks.length > 0 ? (
            <section>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-300">
                Erreurs
              </p>

              <div className="space-y-2">
                {errorTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-300" />

                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-rose-100/80">
                          {task.errorMessage ?? "Erreur BrainiaK"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Activité récente
            </p>

            {recentActivities.length > 0 ? (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                  >
                    <div className="flex items-start gap-2">
                      {activity.level === "success" ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      ) : activity.level === "error" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-300" />
                      ) : activity.level === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                      ) : (
                        <Clock className="mt-0.5 h-4 w-4 text-cyan-300" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {activity.title}
                        </p>
                        {activity.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                            {activity.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                          {formatTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-secondary)]">
                Aucune activité récente.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}