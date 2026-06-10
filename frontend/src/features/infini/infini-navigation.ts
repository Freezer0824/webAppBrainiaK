import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  FileText,
  Home,
  Inbox,
  Mail,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { AppView, InfiniNavigationItem } from "./infini-types";

export const infiniNavigationItems: Array<
  InfiniNavigationItem & {
    icon: React.ComponentType<{ className?: string }>;
  }
> = [
  {
    view: "home",
    label: "Accueil",
    description: "Vue d’ensemble des priorités du cabinet.",
    icon: Home,
  },
  {
    view: "assistant",
    label: "Assistant BrainiaK",
    description: "Copilote métier disponible à tout moment.",
    icon: Bot,
  },
  {
    view: "mailbox",
    label: "Boîte mail",
    description: "Traitement, relances et brouillons assistés.",
    icon: Inbox,
  },
  {
    view: "clients",
    label: "Dossiers clients",
    description: "Suivi des clients, documents et informations clés.",
    icon: BriefcaseBusiness,
  },
  {
    view: "complisoft",
    label: "COMPLISOFT",
    description: "Préparation des données de conformité.",
    icon: FileCheck2,
  },
  {
    view: "ribddc",
    label: "RIBDDC",
    description: "Génération guidée avec validation humaine.",
    icon: FileText,
  },
  {
    view: "templates",
    label: "Mails modèles",
    description: "Templates personnalisables pour les échanges clients.",
    icon: Mail,
  },
  {
    view: "vault",
    label: "Coffre-fort",
    description: "Accès sécurisés aux plateformes externes.",
    icon: ShieldCheck,
  },
  {
    view: "validations",
    label: "Validations",
    description: "Contrôle des actions avant envoi ou synchronisation.",
    icon: CheckCircle2,
  },
  {
    view: "settings",
    label: "Paramètres",
    description: "Préférences, connexions et sécurité.",
    icon: Settings,
  },
];

export function isAppView(value: string): value is AppView {
  return infiniNavigationItems.some((item) => item.view === value);
}