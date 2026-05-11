import { MetricsCard } from "./metrics-card";
import { SignalsPanel } from "./signals-panel";
import { LiveLogConsole } from "./live-log-console";

export function ObservabilityPanel() {
  return (
    <div className="space-y-4">
      <section>
        <h4 className="heading-brainiak text-sm mb-2">Observability</h4>
        <p className="text-xs text-secondary mb-3">
          Runtime execution, signals and logs
        </p>

        <div className="space-y-4">
          <MetricsCard />
          <SignalsPanel />
          <LiveLogConsole />
        </div>
      </section>
    </div>
  );
}