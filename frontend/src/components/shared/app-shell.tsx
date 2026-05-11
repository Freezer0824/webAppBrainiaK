import { Sidebar, type AppView } from "./sidebar";
import { TopBar } from "./top-bar";
import { ChatWindow } from "./chat-window";
import { ToolPanel } from "./tool-panel";
import { RequestsDashboard } from "./requests-dashboard";
import { DevChatDashboard } from "./dev-chat-dashboard";
import { ToolsDashboard } from "./tools-dashboard";
import { ModesDashboard } from "./modes-dashboard";
import { SensoryDashboard } from "./sensory-dashboard";
import { CrystalsDashboard } from "./crystals-dashboard";
import { LearningDashboard } from "./learning-dashboard";
import { SystemDashboard } from "./system-dashboard";
import type { ChatMessage, ConversationItem, ToolEvent } from "@/types/chat";

type AppShellProps = {
  conversations: ConversationItem[];
  messages: ChatMessage[];
  toolEvents: ToolEvent[];
  activeView: AppView;
  onViewChange: (view: AppView) => void;
};

function renderMainView(activeView: AppView, messages: ChatMessage[]) {
  switch (activeView) {
    case "assistant":
      return <ChatWindow messages={messages} />;
    case "requests":
      return <RequestsDashboard />;
    case "dev-chat":
      return <DevChatDashboard />;
    case "tools":
      return <ToolsDashboard />;
    case "modes":
      return <ModesDashboard />;
    case "sensory":
      return <SensoryDashboard />;
    case "crystals":
      return <CrystalsDashboard />;
    case "learning":
      return <LearningDashboard />;
    case "system":
      return <SystemDashboard />;
    default:
      return <ChatWindow messages={messages} />;
  }
}

export function AppShell({
  conversations,
  messages,
  toolEvents,
  activeView,
  onViewChange,
}: AppShellProps) {
  return (
    <main className="bg-brainiak h-screen w-full overflow-hidden text-primary">
      <div className="grid h-screen w-full grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="min-h-0 min-w-0">
          <Sidebar
            conversations={conversations}
            activeView={activeView}
            onViewChange={onViewChange}
          />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-x border-[var(--border)]">
          <TopBar />
          <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto">
            {renderMainView(activeView, messages)}
          </div>
        </section>

        <div className="hidden min-h-0 min-w-0 lg:block">
          <ToolPanel toolEvents={toolEvents} />
        </div>
      </div>
    </main>
  );
}