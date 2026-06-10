import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { ChatWindow } from "./chat-window";
import { InfiniHome } from "@/components/infini/infini-home";
import { MailboxDashboard } from "@/components/infini/mailbox-dashboard";
import { ClientFilesDashboard } from "@/components/infini/client-files-dashboard";
import { ComplisoftDashboard } from "@/components/infini/complisoft-dashboard";
import { RibddcDashboard } from "@/components/infini/ribddc-dashboard";
import { MailTemplatesDashboard } from "@/components/infini/mail-templates-dashboard";
import { VaultDashboard } from "@/components/infini/vault-dashboard";
import { ValidationCenter } from "@/components/infini/validation-center";
import { SettingsDashboard } from "@/components/infini/settings-dashboard";
import type { AppView } from "@/features/infini/infini-types";
import type { ChatMessage, ConversationItem, ToolEvent } from "@/types/chat";

type AppShellProps = {
  conversations: ConversationItem[];
  messages: ChatMessage[];
  toolEvents: ToolEvent[];
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

function renderMainView(
  activeView: AppView,
  messages: ChatMessage[],
  onViewChange: (view: AppView) => void,
) {
  switch (activeView) {
    case "home":
      return <InfiniHome onViewChange={onViewChange} />;

    case "assistant":
      return <ChatWindow messages={messages} />;

    case "mailbox":
      return <MailboxDashboard />;

    case "clients":
      return <ClientFilesDashboard />;

    case "complisoft":
      return <ComplisoftDashboard />;

    case "ribddc":
      return <RibddcDashboard />;

    case "templates":
      return <MailTemplatesDashboard />;

    case "vault":
      return <VaultDashboard />;

    case "validations":
      return <ValidationCenter />;

    case "settings":
      return <SettingsDashboard />;

    default:
      return <InfiniHome onViewChange={onViewChange} />;
  }
}

export function AppShell({
  conversations,
  messages,
  activeView,
  onViewChange,
}: AppShellProps) {
  return (
    <main className="bg-brainiak h-screen w-full overflow-hidden text-primary">
      <div className="grid h-screen w-full grid-cols-[280px_minmax(0,1fr)]">
        <div className="min-h-0 min-w-0">
          <Sidebar
            conversations={conversations}
            activeView={activeView}
            onViewChange={onViewChange}
          />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-x border-[var(--border)]">
          <TopBar activeView={activeView} />

          <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto">
            {renderMainView(activeView, messages, onViewChange)}
          </div>
        </section>
      </div>
    </main>
  );
}