import { useMemo, useState } from "react";
import { Bell, PanelRight, Settings2 } from "lucide-react";
import { NotificationPanel } from "@/components/infini/notification-panel";
import { Button } from "@/components/ui/button";
import { useActivityStore } from "@/store/activity-store";
import { useValidationStore } from "@/store/validation-store";
import { useWorkflowStore } from "@/store/workflow-store";
import type { AppView } from "@/features/infini/infini-types";

type TopBarProps = {
  activeView: AppView;
};

const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
  home: {
    title: "Accueil",
    subtitle: "Vue d’ensemble des opérations Infini",
  },
  assistant: {
    title: "Assistant BrainiaK",
    subtitle: "Copilote métier pour les mails, dossiers, RIBDDC et conformité",
  },
  mailbox: {
    title: "Boîte mail",
    subtitle: "Tri, relances, réponses et archivage assisté",
  },
  clients: {
    title: "Dossiers clients",
    subtitle: "Suivi des clients, documents et informations clés",
  },
  complisoft: {
    title: "COMPLISOFT",
    subtitle: "Préparation et contrôle des données de conformité",
  },
  ribddc: {
    title: "RIBDDC",
    subtitle: "Génération guidée avec validation humaine",
  },
  templates: {
    title: "Mails modèles",
    subtitle: "Templates, variables et brouillons personnalisés",
  },
  vault: {
    title: "Coffre-fort",
    subtitle: "Accès sécurisés aux plateformes métier",
  },
  validations: {
    title: "Validations",
    subtitle: "Actions à vérifier avant envoi ou synchronisation",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Connexions, sécurité et préférences",
  },
};

export function TopBar({ activeView }: TopBarProps) {
  const current = viewTitles[activeView];
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const activities = useActivityStore((state) => state.activities);
  const validations = useValidationStore((state) => state.validations);
  const tasks = useWorkflowStore((state) => state.tasks);

  const notificationCount = useMemo(() => {
    const runningTasks = tasks.filter((task) => task.status === "running").length;
    const errorTasks = tasks.filter((task) => task.status === "error").length;
    const pendingValidations = validations.filter(
      (validation) => validation.status === "en attente",
    ).length;

    return runningTasks + errorTasks + pendingValidations;
  }, [tasks, validations]);

  const hasRecentActivity = activities.length > 0;

  return (
    <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-5">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">
          {current.title}
        </h2>

        <p className="truncate text-xs text-[var(--text-secondary)]">
          {current.subtitle}
        </p>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 md:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        BrainiaK prêt · validation humaine active
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative text-[var(--text-secondary)]"
          >
            <Bell className="h-4 w-4" />

            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            ) : hasRecentActivity ? (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-cyan-400" />
            ) : null}
          </Button>

          {notificationsOpen ? <NotificationPanel /> : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Paramètres"
          className="text-[var(--text-secondary)]"
        >
          <Settings2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Panneau latéral"
          className="text-[var(--text-secondary)] lg:hidden"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}