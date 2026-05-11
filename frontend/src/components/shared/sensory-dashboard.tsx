import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Activity,
  FileAudio,
  Image,
  Mic,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Volume2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";
import {
  getHeartbeatStatus,
  getHeartbeatTensions,
  getLastVoiceWavUrl,
  getProactiveEvents,
  getSensoryConfig,
  getSensoryDevices,
  getSensoryState,
  heartbeatPing,
  heartbeatSleep,
  heartbeatStart,
  heartbeatStop,
  heartbeatWake,
  injectAudio,
  patchSensoryConfig,
  sendVisionFrame,
  setHeartbeatInterval,
  setSensoryDeviceRouting,
  setTokenlessMode,
  speakVoice,
  uploadAudio,
} from "@/lib/api/sensory-api";

type SensoryTab =
  | "state"
  | "config"
  | "devices"
  | "heartbeat"
  | "audio"
  | "vision"
  | "voice"
  | "events";

const TABS: Array<{ id: SensoryTab; label: string }> = [
  { id: "state", label: "State" },
  { id: "config", label: "Config" },
  { id: "devices", label: "Devices" },
  { id: "heartbeat", label: "Heartbeat" },
  { id: "audio", label: "Audio" },
  { id: "vision", label: "Vision" },
  { id: "voice", label: "Voice" },
  { id: "events", label: "Events" },
];

const DEFAULT_CONFIG_PATCH = {
  enabled: true,
};

const DEFAULT_DEVICE_ROUTING = {
  input_device: "default",
  output_device: "default",
};

const DEFAULT_AUDIO_INJECT = {
  source: "front",
  text: "Signal audio injecté depuis le dashboard Sensory.",
};

const DEFAULT_HEARTBEAT_INTERVAL = {
  interval_seconds: 10,
};

const DEFAULT_VOICE_SPEAK = {
  text: "Bonjour, ici Brainiak.",
  voice: "default",
};

const DEFAULT_TOKENLESS_MODE = {
  enabled: true,
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function previewPayload(value: unknown) {
  try {
    return prettyJson(value).slice(0, 600);
  } catch {
    return String(value).slice(0, 600);
  }
}

function parseJsonInput(value: string) {
  try {
    return {
      ok: true as const,
      value: JSON.parse(value) as unknown,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "JSON invalide",
    };
  }
}

export function SensoryDashboard() {
  const [activeTab, setActiveTab] = useState<SensoryTab>("state");

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [configPatch, setConfigPatch] = useState(prettyJson(DEFAULT_CONFIG_PATCH));
  const [deviceRouting, setDeviceRouting] = useState(
    prettyJson(DEFAULT_DEVICE_ROUTING),
  );
  const [audioInject, setAudioInject] = useState(prettyJson(DEFAULT_AUDIO_INJECT));
  const [heartbeatInterval, setHeartbeatIntervalValue] = useState(
    prettyJson(DEFAULT_HEARTBEAT_INTERVAL),
  );
  const [voiceSpeak, setVoiceSpeak] = useState(prettyJson(DEFAULT_VOICE_SPEAK));
  const [tokenlessPayload, setTokenlessPayload] = useState(
    prettyJson(DEFAULT_TOKENLESS_MODE),
  );

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const visionInputRef = useRef<HTMLInputElement | null>(null);

  const parsedConfigPatch = useMemo(
    () => parseJsonInput(configPatch),
    [configPatch],
  );
  const parsedDeviceRouting = useMemo(
    () => parseJsonInput(deviceRouting),
    [deviceRouting],
  );
  const parsedAudioInject = useMemo(
    () => parseJsonInput(audioInject),
    [audioInject],
  );
  const parsedHeartbeatInterval = useMemo(
    () => parseJsonInput(heartbeatInterval),
    [heartbeatInterval],
  );
  const parsedVoiceSpeak = useMemo(() => parseJsonInput(voiceSpeak), [voiceSpeak]);
  const parsedTokenlessPayload = useMemo(
    () => parseJsonInput(tokenlessPayload),
    [tokenlessPayload],
  );

  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

  async function runAction(
    action: string,
    route: string,
    method: string,
    callback: () => Promise<unknown>,
  ) {
    const startedAt = performance.now();

    setLastAction(() => async () => {
      await runAction(action, route, method, callback);
    });    

    setLoadingAction(action);
    setError(null);

    pushApiEvent({
      module: "Sensory",
      action,
      method,
      route,
      status: "running",
      httpStatus: null,
      durationMs: null,
      payloadPreview: null,
      error: null,
    });

    try {
      const payload = await callback();
      const durationMs = Math.round(performance.now() - startedAt);

      setResult(payload);

      pushApiEvent({
        module: "Sensory",
        action,
        method,
        route,
        status: "success",
        httpStatus: 200,
        durationMs,
        payloadPreview: previewPayload(payload),
        error: null,
      });

      return payload;
    } catch (actionError) {
      const durationMs = Math.round(performance.now() - startedAt);
      const message =
        actionError instanceof Error ? actionError.message : "Erreur inconnue.";

      setError(message);

      pushApiEvent({
        module: "Sensory",
        action,
        method,
        route,
        status: "error",
        httpStatus: null,
        durationMs,
        payloadPreview: null,
        error: message,
      });

      return null;
    } finally {
      setLoadingAction(null);
    }
  }

  function resetTabInputs() {
    setConfigPatch(prettyJson(DEFAULT_CONFIG_PATCH));
    setDeviceRouting(prettyJson(DEFAULT_DEVICE_ROUTING));
    setAudioInject(prettyJson(DEFAULT_AUDIO_INJECT));
    setHeartbeatIntervalValue(prettyJson(DEFAULT_HEARTBEAT_INTERVAL));
    setVoiceSpeak(prettyJson(DEFAULT_VOICE_SPEAK));
    setTokenlessPayload(prettyJson(DEFAULT_TOKENLESS_MODE));
    setError(null);
    setLastAction(null);
  }

  async function handlePatchConfig() {
    if (!parsedConfigPatch.ok) {
      setError(`JSON config invalide : ${parsedConfigPatch.error}`);
      return;
    }

    await runAction(
      "patch-config",
      "PATCH /v1/sensory/config",
      "PATCH",
      () => patchSensoryConfig(parsedConfigPatch.value),
    );
  }

  async function handleSaveRouting() {
    if (!parsedDeviceRouting.ok) {
      setError(`JSON routing invalide : ${parsedDeviceRouting.error}`);
      return;
    }

    await runAction(
      "save-routing",
      "PUT /v1/sensory/devices/routing",
      "PUT",
      () => setSensoryDeviceRouting(parsedDeviceRouting.value),
    );
  }

  async function handleInjectAudio() {
    if (!parsedAudioInject.ok) {
      setError(`JSON audio invalide : ${parsedAudioInject.error}`);
      return;
    }

    await runAction(
      "inject-audio",
      "POST /v1/audio/inject",
      "POST",
      () => injectAudio(parsedAudioInject.value),
    );
  }

  async function handleSetHeartbeatInterval() {
    if (!parsedHeartbeatInterval.ok) {
      setError(`JSON interval invalide : ${parsedHeartbeatInterval.error}`);
      return;
    }

    await runAction(
      "set-heartbeat-interval",
      "POST /v1/heartbeat/interval",
      "POST",
      () => setHeartbeatInterval(parsedHeartbeatInterval.value),
    );
  }

  async function handleSpeak() {
    if (!parsedVoiceSpeak.ok) {
      setError(`JSON voice invalide : ${parsedVoiceSpeak.error}`);
      return;
    }

    await runAction(
      "voice-speak",
      "POST /v1/voice/speak",
      "POST",
      () => speakVoice(parsedVoiceSpeak.value),
    );
  }

  async function handleSetTokenlessMode() {
    if (!parsedTokenlessPayload.ok) {
      setError(`JSON tokenless invalide : ${parsedTokenlessPayload.error}`);
      return;
    }

    await runAction(
      "tokenless-mode",
      "POST /v1/tokenless_mode",
      "POST",
      () => setTokenlessMode(parsedTokenlessPayload.value),
    );
  }

  async function handleAudioSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    await runAction(
      "upload-audio",
      "POST /v1/audio/upload",
      "POST",
      () => uploadAudio(file, "front"),
    );

    event.target.value = "";
  }

  async function handleVisionSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    await runAction(
      "vision-frame",
      "POST /v1/vision/frame",
      "POST",
      () => sendVisionFrame(file, "front"),
    );

    event.target.value = "";
  }

  function playLastVoiceWav() {
    const audio = new Audio(getLastVoiceWavUrl());
    void audio.play();
  }

  function JsonEditor({
    title,
    value,
    onChange,
    valid,
    errorText,
  }: {
    title: string;
    value: string;
    onChange: (value: string) => void;
    valid: boolean;
    errorText?: string;
  }) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h2>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetTabInputs}
            className="border-[var(--border)] bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="min-h-[180px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
        />

        {!valid ? (
          <p className="mt-3 text-sm text-red-300">JSON invalide : {errorText}</p>
        ) : null}
      </div>
    );
  }

  return (
    <section className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto bg-[var(--surface-0)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Brainiak Control Console
          </p>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="heading-brainiak text-3xl text-[var(--text-primary)]">
                Sensory
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Piloter les capacités sensory : état, configuration, devices,
                heartbeat, audio, vision, voice et événements.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                État connexion
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {loadingAction ? "Action en cours..." : "Prêt"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "GET /v1/sensory/state",
              "GET /v1/sensory/config",
              "GET /v1/sensory/devices",
              "GET /v1/heartbeat/status",
              "POST /v1/audio/upload",
              "POST /v1/vision/frame",
              "POST /v1/voice/speak",
              "GET /v1/events",
            ].map((route) => (
              <span
                key={route}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
              >
                {route}
              </span>
            ))}
          </div>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-cyan-500/10 text-cyan-200"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {activeTab === "state" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  State
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      void runAction(
                        "refresh-state",
                        "GET /v1/sensory/state",
                        "GET",
                        getSensoryState,
                      )
                    }
                    disabled={loadingAction !== null}
                    className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh State
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "config" && (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Config
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        void runAction(
                          "refresh-config",
                          "GET /v1/sensory/config",
                          "GET",
                          getSensoryConfig,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Config
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handlePatchConfig()}
                      disabled={loadingAction !== null || !parsedConfigPatch.ok}
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Patch Config
                    </Button>
                  </div>
                </div>

                <JsonEditor
                  title="Config Patch JSON"
                  value={configPatch}
                  onChange={setConfigPatch}
                  valid={parsedConfigPatch.ok}
                  errorText={parsedConfigPatch.ok ? undefined : parsedConfigPatch.error}
                />
              </>
            )}

            {activeTab === "devices" && (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Devices
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        void runAction(
                          "refresh-devices",
                          "GET /v1/sensory/devices",
                          "GET",
                          getSensoryDevices,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Devices
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleSaveRouting()}
                      disabled={loadingAction !== null || !parsedDeviceRouting.ok}
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Routing
                    </Button>
                  </div>
                </div>

                <JsonEditor
                  title="Device Routing JSON"
                  value={deviceRouting}
                  onChange={setDeviceRouting}
                  valid={parsedDeviceRouting.ok}
                  errorText={
                    parsedDeviceRouting.ok ? undefined : parsedDeviceRouting.error
                  }
                />
              </>
            )}

            {activeTab === "heartbeat" && (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Heartbeat
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        void runAction(
                          "heartbeat-status",
                          "GET /v1/heartbeat/status",
                          "GET",
                          getHeartbeatStatus,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Status
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-tensions",
                          "GET /v1/heartbeat/tensions",
                          "GET",
                          getHeartbeatTensions,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Tensions
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-start",
                          "POST /v1/heartbeat/start",
                          "POST",
                          heartbeatStart,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Start
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-stop",
                          "POST /v1/heartbeat/stop",
                          "POST",
                          heartbeatStop,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Stop
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-ping",
                          "POST /v1/heartbeat/ping",
                          "POST",
                          heartbeatPing,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Ping
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-sleep",
                          "POST /v1/heartbeat/sleep",
                          "POST",
                          heartbeatSleep,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Sleep
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void runAction(
                          "heartbeat-wake",
                          "POST /v1/heartbeat/wake",
                          "POST",
                          heartbeatWake,
                        )
                      }
                      disabled={loadingAction !== null}
                      className="border-[var(--border)] bg-transparent"
                    >
                      Wake
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleSetHeartbeatInterval()}
                      disabled={
                        loadingAction !== null || !parsedHeartbeatInterval.ok
                      }
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Set Interval
                    </Button>
                  </div>
                </div>

                <JsonEditor
                  title="Heartbeat Interval JSON"
                  value={heartbeatInterval}
                  onChange={setHeartbeatIntervalValue}
                  valid={parsedHeartbeatInterval.ok}
                  errorText={
                    parsedHeartbeatInterval.ok
                      ? undefined
                      : parsedHeartbeatInterval.error
                  }
                />
              </>
            )}

            {activeTab === "audio" && (
              <>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioSelected}
                />

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Audio
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={loadingAction !== null}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <FileAudio className="mr-2 h-4 w-4" />
                      Upload Audio
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleInjectAudio()}
                      disabled={loadingAction !== null || !parsedAudioInject.ok}
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Inject Audio
                    </Button>
                  </div>
                </div>

                <JsonEditor
                  title="Audio Inject JSON"
                  value={audioInject}
                  onChange={setAudioInject}
                  valid={parsedAudioInject.ok}
                  errorText={parsedAudioInject.ok ? undefined : parsedAudioInject.error}
                />
              </>
            )}

            {activeTab === "vision" && (
              <>
                <input
                  ref={visionInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleVisionSelected}
                />

                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Vision
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => visionInputRef.current?.click()}
                      disabled={loadingAction !== null}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Send Vision Frame
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "voice" && (
              <>
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Voice
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => void handleSpeak()}
                      disabled={loadingAction !== null || !parsedVoiceSpeak.ok}
                      className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Speak
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={playLastVoiceWav}
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play Last WAV
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleSetTokenlessMode()}
                      disabled={loadingAction !== null || !parsedTokenlessPayload.ok}
                      className="border-[var(--border)] bg-transparent"
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Set Tokenless Mode
                    </Button>
                  </div>
                </div>

                <JsonEditor
                  title="Voice Speak JSON"
                  value={voiceSpeak}
                  onChange={setVoiceSpeak}
                  valid={parsedVoiceSpeak.ok}
                  errorText={parsedVoiceSpeak.ok ? undefined : parsedVoiceSpeak.error}
                />

                <JsonEditor
                  title="Tokenless Mode JSON"
                  value={tokenlessPayload}
                  onChange={setTokenlessPayload}
                  valid={parsedTokenlessPayload.ok}
                  errorText={
                    parsedTokenlessPayload.ok
                      ? undefined
                      : parsedTokenlessPayload.error
                  }
                />
              </>
            )}

            {activeTab === "events" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Events
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      void runAction(
                        "refresh-events",
                        "GET /v1/events",
                        "GET",
                        getProactiveEvents,
                      )
                    }
                    disabled={loadingAction !== null}
                    className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Events
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Résultat brut
              </h2>

              <pre className="mt-3 max-h-[520px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
                {result ? prettyJson(result) : "Aucun résultat pour le moment."}
              </pre>
            </div>
          </aside>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
            <h2 className="text-sm font-semibold text-red-200">
              Message d’erreur
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-100/80">{error}</p>

            {lastAction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void lastAction()}
                disabled={loadingAction !== null}
                className="mt-4 border-red-500/30 bg-transparent text-red-200 hover:bg-red-500/10"
              >
                Réessayer
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}