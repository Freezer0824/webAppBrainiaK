# Audit des routes API — BrainiaK origin v8
Analyse statique du repo `Brainiak-origin_v8.zip`. Point d’entrée Core identifié : `uvicorn brainiak.core.api.app:create_app --factory`.
## Synthèse
- Routes Core montées activement par `brainiak/core/api/app.py` : **107**.
- Routes services FastAPI autonomes optionnels ou doublons : **30**.
- Routes legacy/non montées détectées : **103**.
- `brainiak/core/api/dev_routes_legacy_v4.py` existe mais n’est pas importé par `create_app()` : classé **legacy / non montée**.
- `brainiak.old/**` est un miroir ancien : classé **legacy / non montée**.
- Les routes Tool Hub existent deux fois : en mode **in-process** dans le Core (`/v1/tools/*`) et en service autonome `brainiak/tool_hub/main.py`.
## Routers effectivement montés dans le Core
```python
app.include_router(router)          # brainiak/core/api/routes.py
app.include_router(admin_router)    # admin_routes.py
app.include_router(dev_router)      # dev_routes.py
app.include_router(ui_router)       # ui_routes.py
app.include_router(v1_router)       # v1_routes.py
app.include_router(crystal_router)  # crystal_routes.py
app.include_router(sensory_router)  # sensory_routes.py
app.include_router(teaching_router) # teaching_routes.py
app.include_router(lawer_router)    # lawer_routes.py
_mount_toolhub_routes(app)          # /v1/tools/* + /toolhub/health
```
## Routes actives — Core FastAPI principal
| Statut | Type | Méthode | Route | Entrée | Paramètres | Réponse | Handler | Source |
|---|---|---:|---|---|---|---|---|---|
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/aggregate/daily` | `DailyAggregateRequest` | `—` | `—` | `trigger_daily_aggregate` | `brainiak/core/api/admin_routes.py:89` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/aggregate/weekly` | `WeeklyAggregateRequest` | `—` | `—` | `trigger_weekly_aggregate` | `brainiak/core/api/admin_routes.py:115` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/batch/nightly` | `NightlyBatchRequest` | `—` | `—` | `trigger_nightly_batch` | `brainiak/core/api/admin_routes.py:176` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/bootstrap/calibrate` | `BootstrapRunRequest` | `—` | `—` | `bootstrap_calibrate` | `brainiak/core/api/admin_routes.py:345` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/bootstrap/run` | `BootstrapRunRequest` | `—` | `—` | `bootstrap_run` | `brainiak/core/api/admin_routes.py:323` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/v0/admin/bootstrap/status` | `—` | `tenant_id: str` | `—` | `bootstrap_status` | `brainiak/core/api/admin_routes.py:311` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/mathcore/pipeline` | `MathCorePipelineRequest` | `—` | `—` | `trigger_mathcore_pipeline` | `brainiak/core/api/admin_routes.py:141` |
| ACTIF_CORE | Back↔Back | GET | `/v0/admin/recommendation/active` | `—` | `tenant_id: str` | `—` | `get_active_recommendation` | `brainiak/core/api/admin_routes.py:285` |
| ACTIF_CORE | Back↔Back | GET | `/v0/admin/registry/nodes` | `—` | `reload: bool` | `—` | `list_registry_nodes` | `brainiak/core/api/admin_routes.py:364` |
| ACTIF_CORE | Back↔Back | POST | `/v0/admin/telemetry/ingest` | `TelemetryIngestRequest` | `—` | `—` | `ingest_telemetry` | `brainiak/core/api/admin_routes.py:234` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/toolhub/health` | `—` | `—` | `—` | `_toolhub_health` | `brainiak/core/api/app.py:312` |
| ACTIF_CORE | Back↔Back | POST | `/v1/tools/call` | `ToolCallRequest` | `—` | `ToolCallResponse` | `_call_tool` | `brainiak/core/api/app.py:274` |
| ACTIF_CORE | Back↔Back | GET | `/v1/tools/list` | `—` | `role: str` | `—` | `_list_tools` | `brainiak/core/api/app.py:264` |
| ACTIF_CORE | Front↔Back | GET | `/v1/crystals/encode` | `—` | `text: str, include_s5: bool` | `—` | `crystals_encode` | `brainiak/core/api/crystal_routes.py:265` |
| ACTIF_CORE | Front↔Back | GET | `/v1/crystals/info` | `—` | `—` | `CrystalInfo` | `crystals_info` | `brainiak/core/api/crystal_routes.py:114` |
| ACTIF_CORE | Front↔Back | GET | `/v1/crystals/lookup` | `—` | `word: str, include_s5: bool` | `CrystalResult` | `crystals_lookup` | `brainiak/core/api/crystal_routes.py:121` |
| ACTIF_CORE | Front↔Back | POST | `/v1/crystals/lookup_batch` | `BatchLookupRequest` | `—` | `—` | `crystals_lookup_batch` | `brainiak/core/api/crystal_routes.py:164` |
| ACTIF_CORE | Front↔Back | POST | `/v1/crystals/nearest` | `NearestRequest` | `—` | `—` | `crystals_nearest` | `brainiak/core/api/crystal_routes.py:208` |
| ACTIF_CORE | Front↔Back | POST | `/v0/dev/chat` | `DevChatRequest` | `—` | `DevChatResponse` | `dev_chat` | `brainiak/core/api/dev_routes.py:780` |
| ACTIF_CORE | Front↔Back | POST | `/v0/dev/chat/async` | `DevChatRequest` | `—` | `—` | `dev_chat_async_submit` | `brainiak/core/api/dev_routes.py:801` |
| ACTIF_CORE | Front↔Back | POST | `/v0/dev/chat/stream` | `DevChatRequest` | `—` | `—` | `dev_chat_stream` | `brainiak/core/api/dev_routes.py:817` |
| ACTIF_CORE | Front↔Back | GET | `/v0/dev/chat/{job_id}/result` | `—` | `job_id: str` | `DevChatResponse` | `dev_chat_job_result` | `brainiak/core/api/dev_routes.py:1061` |
| ACTIF_CORE | Front↔Back | GET | `/v0/dev/chat/{job_id}/status` | `—` | `job_id: str` | `DevJobStatus` | `dev_chat_job_status` | `brainiak/core/api/dev_routes.py:1046` |
| ACTIF_CORE | Back↔Back probable | GET | `/v0/dev/mathcore/gamma` | `—` | `—` | `—` | `mathcore_gamma` | `brainiak/core/api/dev_routes.py:1075` |
| ACTIF_CORE | Front↔Back | DELETE | `/v0/dev/session` | `—` | `session_id: str` | `—` | `clear_session` | `brainiak/core/api/dev_routes.py:396` |
| ACTIF_CORE | Front↔Back | GET | `/v0/dev/session` | `—` | `session_id: str` | `—` | `get_session` | `brainiak/core/api/dev_routes.py:376` |
| ACTIF_CORE | Front↔Back | POST | `/v0/dev/session/messages` | `_AppendSessionBody` | `session_id: str` | `—` | `append_session_messages` | `brainiak/core/api/dev_routes.py:382` |
| ACTIF_CORE | Front↔Back | GET | `/lawer` | `—` | `—` | `—` | `lawer_page` | `brainiak/core/api/lawer_routes.py:47` |
| ACTIF_CORE | Front↔Back | POST | `/lawer/chat` | `—` | `—` | `—` | `lawer_chat` | `brainiak/core/api/lawer_routes.py:154` |
| ACTIF_CORE | Front↔Back | POST | `/lawer/generate` | `Dict[str, Any]` | `fields: Dict[str, Any]` | `—` | `generate_spa` | `brainiak/core/api/lawer_routes.py:93` |
| ACTIF_CORE | Front↔Back | POST | `/lawer/parse` | `—` | `—` | `—` | `parse_loi` | `brainiak/core/api/lawer_routes.py:56` |
| ACTIF_CORE | Front↔Back | POST | `/lawer/save-template` | `—` | `—` | `—` | `save_template` | `brainiak/core/api/lawer_routes.py:213` |
| ACTIF_CORE | Front↔Back | GET | `/lawer/templates` | `—` | `—` | `—` | `list_templates` | `brainiak/core/api/lawer_routes.py:246` |
| ACTIF_CORE | Front↔Back | GET | `/lawer/templates/{name}` | `—` | `name: str` | `—` | `load_template` | `brainiak/core/api/lawer_routes.py:261` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/health` | `—` | `—` | `HealthResponse` | `health` | `brainiak/core/api/routes.py:188` |
| ACTIF_CORE | Hybride API client↔Core | POST | `/v0/request` | `RequestInput` | `—` | `RequestAccepted` | `submit_request` | `brainiak/core/api/routes.py:66` |
| ACTIF_CORE | Hybride API client↔Core | GET | `/v0/request/{request_id}/response` | `—` | `request_id: UUID` | `ResponseOutput` | `get_request_response` | `brainiak/core/api/routes.py:159` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/v0/request/{request_id}/status` | `—` | `request_id: UUID` | `RequestStatusResponse` | `get_request_status` | `brainiak/core/api/routes.py:135` |
| ACTIF_CORE | Front↔Back | POST | `/v1/audio/inject` | `InjectRequest` | `—` | `—` | `audio_inject` | `brainiak/core/api/sensory_routes.py:166` |
| ACTIF_CORE | Front↔Back | POST | `/v1/audio/upload` | `multipart/form-data ; fichiers: audio: UploadFile` | `source: str, client_ts: float | None` | `—` | `audio_upload` | `brainiak/core/api/sensory_routes.py:177` |
| ACTIF_CORE | Front↔Back | GET | `/v1/events` | `—` | `—` | `—` | `proactive_events` | `brainiak/core/api/sensory_routes.py:1568` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/interval` | `_HeartbeatIntervalRequest` | `—` | `—` | `heartbeat_set_interval` | `brainiak/core/api/sensory_routes.py:1663` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/ping` | `—` | `—` | `—` | `heartbeat_ping` | `brainiak/core/api/sensory_routes.py:1625` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/sleep` | `—` | `—` | `—` | `heartbeat_force_sleep` | `brainiak/core/api/sensory_routes.py:1674` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/start` | `—` | `—` | `—` | `heartbeat_start` | `brainiak/core/api/sensory_routes.py:1602` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/v1/heartbeat/status` | `—` | `—` | `—` | `heartbeat_status` | `brainiak/core/api/sensory_routes.py:1632` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/stop` | `—` | `—` | `—` | `heartbeat_stop` | `brainiak/core/api/sensory_routes.py:1614` |
| ACTIF_CORE | Front↔Back | GET | `/v1/heartbeat/tensions` | `—` | `—` | `—` | `heartbeat_tensions` | `brainiak/core/api/sensory_routes.py:1694` |
| ACTIF_CORE | Front↔Back | POST | `/v1/heartbeat/wake` | `—` | `—` | `—` | `heartbeat_force_wake` | `brainiak/core/api/sensory_routes.py:1685` |
| ACTIF_CORE | Front↔Back | GET | `/v1/sensory/config` | `—` | `—` | `—` | `get_config` | `brainiak/core/api/sensory_routes.py:353` |
| ACTIF_CORE | Front↔Back | PATCH | `/v1/sensory/config` | `ConfigPatch` | `—` | `—` | `patch_config` | `brainiak/core/api/sensory_routes.py:361` |
| ACTIF_CORE | Front↔Back | GET | `/v1/sensory/devices` | `—` | `—` | `—` | `get_devices` | `brainiak/core/api/sensory_routes.py:372` |
| ACTIF_CORE | Front↔Back | PUT | `/v1/sensory/devices/routing` | `DeviceRouting` | `—` | `—` | `set_routing` | `brainiak/core/api/sensory_routes.py:432` |
| ACTIF_CORE | Front↔Back | GET | `/v1/sensory/state` | `—` | `—` | `—` | `sensory_state` | `brainiak/core/api/sensory_routes.py:259` |
| ACTIF_CORE | Back↔Back probable | GET | `/v1/system/checkup` | `—` | `scale: str, category: str | None` | `—` | `system_checkup` | `brainiak/core/api/sensory_routes.py:444` |
| ACTIF_CORE | Back↔Back probable | GET | `/v1/system/diagnose` | `—` | `—` | `—` | `system_diagnose` | `brainiak/core/api/sensory_routes.py:452` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/v1/teaching/status` | `—` | `—` | `—` | `teaching_status` | `brainiak/core/api/sensory_routes.py:1732` |
| ACTIF_CORE | Front↔Back | POST | `/v1/tokenless_mode` | `dict` | `—` | `—` | `set_tokenless_mode` | `brainiak/core/api/sensory_routes.py:55` |
| ACTIF_CORE | Front↔Back | POST | `/v1/vision/frame` | `multipart/form-data ; fichiers: image: UploadFile` | `source: str, client_ts: float | None` | `—` | `vision_frame` | `brainiak/core/api/sensory_routes.py:214` |
| ACTIF_CORE | Front↔Back | GET | `/v1/voice/last.wav` | `—` | `—` | `—` | `voice_last_wav` | `brainiak/core/api/sensory_routes.py:156` |
| ACTIF_CORE | Front↔Back | POST | `/v1/voice/speak` | `SpeakRequest` | `—` | `—` | `voice_speak` | `brainiak/core/api/sensory_routes.py:98` |
| ACTIF_CORE | Front↔Back | GET | `/teaching` | `—` | `—` | `—` | `teaching_dashboard` | `brainiak/core/api/teaching_routes.py:1318` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/audio/{word}` | `—` | `word: str, voice: str` | `—` | `teaching_audio` | `brainiak/core/api/teaching_routes.py:344` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/crystallize` | `query/form params` | `target: str, reward: float` | `—` | `teaching_crystallize_endpoint` | `brainiak/core/api/teaching_routes.py:1180` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/crystallize_primitive` | `PrimitiveCrystallizeRequest` | `—` | `—` | `teaching_crystallize_primitive` | `brainiak/core/api/teaching_routes.py:1203` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/edit-def` | `EditDefRequest` | `—` | `—` | `edit_definition` | `brainiak/core/api/teaching_routes.py:464` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/encode` | `query/form params` | `target: str, show_image: bool` | `—` | `teaching_encode` | `brainiak/core/api/teaching_routes.py:1138` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/events` | `—` | `—` | `—` | `teaching_events` | `brainiak/core/api/teaching_routes.py:181` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/exercise` | `—` | `word: str | None` | `—` | `get_exercise` | `brainiak/core/api/teaching_routes.py:431` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/flush` | `—` | `—` | `—` | `teaching_flush` | `brainiak/core/api/teaching_routes.py:1295` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/image/{word}` | `—` | `word: str` | `—` | `teaching_image` | `brainiak/core/api/teaching_routes.py:332` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/mode` | `ModeRequest` | `—` | `—` | `set_mode` | `brainiak/core/api/teaching_routes.py:383` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/navigate` | `query/form params` | `action: str` | `—` | `navigate` | `brainiak/core/api/teaching_routes.py:395` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/phase` | `query/form params` | `phase: str` | `—` | `switch_phase` | `brainiak/core/api/teaching_routes.py:419` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/reinforce` | `ReinforceRequest` | `—` | `—` | `manual_reinforce` | `brainiak/core/api/teaching_routes.py:477` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/teach` | `query/form params` | `stimulus: str, target: str, show_image: bool` | `—` | `teaching_trial` | `brainiak/core/api/teaching_routes.py:1247` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/upload` | `multipart/form-data ; fichiers: file: UploadFile` | `source: str` | `—` | `upload_teaching_file` | `brainiak/core/api/teaching_routes.py:498` |
| ACTIF_CORE | Front↔Back | POST | `/teaching/verify` | `query/form params` | `target: str` | `—` | `teaching_verify` | `brainiak/core/api/teaching_routes.py:1163` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/weights` | `—` | `—` | `—` | `teaching_weights` | `brainiak/core/api/teaching_routes.py:235` |
| ACTIF_CORE | Front↔Back | GET | `/teaching/weights/detail` | `—` | `—` | `—` | `teaching_weights_detail` | `brainiak/core/api/teaching_routes.py:301` |
| ACTIF_CORE | Front↔Back | GET | `/ui` | `—` | `—` | `—` | `serve_ui` | `brainiak/core/api/ui_routes.py:1963` |
| ACTIF_CORE | Front↔Back | GET | `/ui/files` | `—` | `path: str` | `—` | `list_files` | `brainiak/core/api/ui_routes.py:44` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/bootstrap` | `query/form params` | `level: int` | `—` | `bootstrap_nelson` | `brainiak/core/api/v1_routes.py:929` |
| ACTIF_CORE | Back↔Back probable | GET | `/v1/diagnose` | `—` | `text: str` | `—` | `diagnose_text` | `brainiak/core/api/v1_routes.py:667` |
| ACTIF_CORE | Front↔Back | POST | `/v1/feedback` | `FeedbackRequest` | `—` | `—` | `self_learning_feedback` | `brainiak/core/api/v1_routes.py:552` |
| ACTIF_CORE | Front↔Back | POST | `/v1/feedback-sense` | `FeedbackSenseRequest` | `—` | `—` | `feedback_sense` | `brainiak/core/api/v1_routes.py:640` |
| ACTIF_CORE | Back↔Back / supervision | GET | `/v1/learning-status` | `—` | `—` | `—` | `learning_status` | `brainiak/core/api/v1_routes.py:681` |
| ACTIF_CORE | Front↔Back | DELETE | `/v1/modes` | `—` | `—` | `—` | `reset_modes` | `brainiak/core/api/v1_routes.py:1125` |
| ACTIF_CORE | Front↔Back | GET | `/v1/modes` | `—` | `—` | `—` | `get_modes` | `brainiak/core/api/v1_routes.py:1070` |
| ACTIF_CORE | Front↔Back | POST | `/v1/modes` | `dict` | `—` | `—` | `set_modes` | `brainiak/core/api/v1_routes.py:1109` |
| ACTIF_CORE | Front↔Back | DELETE | `/v1/modes/{mode_name}` | `—` | `mode_name: str` | `—` | `deactivate_mode` | `brainiak/core/api/v1_routes.py:1100` |
| ACTIF_CORE | Front↔Back | POST | `/v1/modes/{mode_name}` | `query/form params` | `mode_name: str` | `—` | `activate_mode` | `brainiak/core/api/v1_routes.py:1088` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/production/save` | `—` | `—` | `—` | `save_production` | `brainiak/core/api/v1_routes.py:974` |
| ACTIF_CORE | Front↔Back | POST | `/v1/prompt` | `PromptRequest` | `—` | `—` | `unified_prompt` | `brainiak/core/api/v1_routes.py:467` |
| ACTIF_CORE | Front↔Back | POST | `/v1/prompt/control/{request_id}` | `PipelineControlRequest` | `request_id: str` | `—` | `pipeline_control` | `brainiak/core/api/v1_routes.py:1046` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/reinforce` | `ReinforceRequest` | `—` | `—` | `reinforce` | `brainiak/core/api/v1_routes.py:758` |
| ACTIF_CORE | Back↔Back probable | GET | `/v1/reinforcement-config` | `—` | `—` | `—` | `get_reinforcement_config` | `brainiak/core/api/v1_routes.py:853` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/reinforcement-config` | `ReinforcementConfigRequest` | `—` | `—` | `set_reinforcement_config` | `brainiak/core/api/v1_routes.py:824` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/reinforcement-config/load-valence` | `—` | `—` | `—` | `load_valence` | `brainiak/core/api/v1_routes.py:881` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/reinforcement-config/save-valence` | `—` | `—` | `—` | `save_valence` | `brainiak/core/api/v1_routes.py:873` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/reset-feedback` | `—` | `—` | `—` | `reset_feedback_state` | `brainiak/core/api/v1_routes.py:733` |
| ACTIF_CORE | Front↔Back | POST | `/v1/skinner` | `SkinnerRequest` | `—` | `—` | `skinner_feedback` | `brainiak/core/api/v1_routes.py:1142` |
| ACTIF_CORE | Front↔Back | POST | `/v1/teach` | `TeachRequest` | `—` | `—` | `teach_word` | `brainiak/core/api/v1_routes.py:590` |
| ACTIF_CORE | Front↔Back | POST | `/v1/teach-contrastive` | `TeachContrastiveRequest` | `—` | `—` | `teach_contrastive` | `brainiak/core/api/v1_routes.py:610` |
| ACTIF_CORE | Front↔Back | GET | `/v1/tokenless` | `—` | `—` | `—` | `get_tokenless_status` | `brainiak/core/api/v1_routes.py:721` |
| ACTIF_CORE | Front↔Back | POST | `/v1/tokenless` | `query/form params` | `enable: bool` | `—` | `toggle_tokenless` | `brainiak/core/api/v1_routes.py:704` |
| ACTIF_CORE | Back↔Back probable | POST | `/v1/weights/save` | `—` | `—` | `—` | `save_weights` | `brainiak/core/api/v1_routes.py:1012` |

## Services FastAPI autonomes / optionnels / doublons
| Statut | Type | Méthode | Route | Entrée | Paramètres | Réponse | Handler | Source |
|---|---|---:|---|---|---|---|---|---|
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | GET | `/` | `—` | `—` | `—` | `ui` | `apps/copilot/app.py:357` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/analyze` | `FolderRequest` | `—` | `—` | `analyze` | `apps/copilot/app.py:313` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/draft` | `DraftRequest` | `—` | `—` | `draft` | `apps/copilot/app.py:290` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/query` | `QueryRequest` | `—` | `—` | `query` | `apps/copilot/app.py:341` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back / supervision | GET | `/status` | `—` | `—` | `—` | `status` | `apps/copilot/app.py:251` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/summarize` | `SummarizeRequest` | `—` | `—` | `summarize` | `apps/copilot/app.py:269` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | GET | `/` | `—` | `—` | `—` | `ui` | `apps/copilot/server.py:460` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/chat` | `ChatReq` | `—` | `—` | `chat` | `apps/copilot/server.py:403` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/cluster` | `dict` | `—` | `—` | `cluster_docs` | `apps/copilot/server.py:344` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/draft` | `DraftReq` | `—` | `—` | `draft` | `apps/copilot/server.py:389` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/query` | `QueryReq` | `—` | `—` | `query` | `apps/copilot/server.py:363` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back / supervision | GET | `/status` | `—` | `—` | `—` | `status` | `apps/copilot/server.py:322` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/summarize` | `SumReq` | `—` | `—` | `summarize` | `apps/copilot/server.py:375` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | GET | `/tasks` | `—` | `—` | `—` | `list_tasks` | `apps/copilot/server.py:414` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/tasks` | `AutoTask` | `—` | `—` | `create_task` | `apps/copilot/server.py:418` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | DELETE | `/tasks/{task_id}` | `—` | `task_id: str` | `—` | `delete_task` | `apps/copilot/server.py:435` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | PUT | `/tasks/{task_id}` | `AutoTask` | `task_id: str` | `—` | `update_task` | `apps/copilot/server.py:426` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/tasks/{task_id}/run` | `query/form params` | `task_id: str` | `—` | `run_task_now` | `apps/copilot/server.py:443` |
| SERVICE_AUTONOME_OPTIONNEL | Front↔Back | POST | `/upload` | `multipart/form-data ; fichiers: files: list[UploadFile]` | `—` | `—` | `upload` | `apps/copilot/server.py:328` |
| SERVICE_AUTONOME_DUPLIQUE_CORE | Back↔Back / supervision | GET | `/health` | `—` | `—` | `—` | `health` | `brainiak/tool_hub/main.py:146` |
| SERVICE_AUTONOME_DUPLIQUE_CORE | Back↔Back | POST | `/v1/tools/call` | `ToolCallRequest` | `—` | `ToolCallResponse` | `call_tool` | `brainiak/tool_hub/main.py:103` |
| SERVICE_AUTONOME_DUPLIQUE_CORE | Back↔Back | GET | `/v1/tools/list` | `—` | `role: str` | `—` | `list_tools` | `brainiak/tool_hub/main.py:92` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | POST | `/tts/batch` | `query/form params` | `texts: str, voice: str, language: str, emotion: str` | `—` | `batch_clone` | `deploy/tts/tts_service.py:332` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | POST | `/tts/clone` | `query/form params` | `text: str, voice: str, language: str, emotion: str` | `—` | `clone_speech` | `deploy/tts/tts_service.py:246` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back / supervision | GET | `/tts/health` | `—` | `—` | `—` | `health` | `deploy/tts/tts_service.py:190` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | GET | `/tts/profiles` | `—` | `—` | `—` | `list_profiles` | `deploy/tts/tts_service.py:200` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | POST | `/tts/register` | `multipart/form-data ; fichiers: audio: UploadFile` | `name: str, ref_text: str` | `—` | `register_voice` | `deploy/tts/tts_service.py:205` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back / supervision | GET | `/health` | `—` | `—` | `—` | `health` | `deploy/vllm/mock_server.py:41` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | POST | `/v1/chat/completions` | `ChatRequest` | `—` | `—` | `chat_completions` | `deploy/vllm/mock_server.py:59` |
| SERVICE_AUTONOME_OPTIONNEL | Back↔Back | GET | `/v1/models` | `—` | `—` | `—` | `list_models` | `deploy/vllm/mock_server.py:46` |

## Routes legacy ou non montées
| Statut | Type | Méthode | Route | Entrée | Paramètres | Réponse | Handler | Source |
|---|---|---:|---|---|---|---|---|---|
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/aggregate/daily` | `DailyAggregateRequest` | `—` | `—` | `trigger_daily_aggregate` | `brainiak.old/core/api/admin_routes.py:89` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/aggregate/weekly` | `WeeklyAggregateRequest` | `—` | `—` | `trigger_weekly_aggregate` | `brainiak.old/core/api/admin_routes.py:115` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/batch/nightly` | `NightlyBatchRequest` | `—` | `—` | `trigger_nightly_batch` | `brainiak.old/core/api/admin_routes.py:176` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/bootstrap/calibrate` | `BootstrapRunRequest` | `—` | `—` | `bootstrap_calibrate` | `brainiak.old/core/api/admin_routes.py:345` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/bootstrap/run` | `BootstrapRunRequest` | `—` | `—` | `bootstrap_run` | `brainiak.old/core/api/admin_routes.py:323` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/admin/bootstrap/status` | `—` | `tenant_id: str` | `—` | `bootstrap_status` | `brainiak.old/core/api/admin_routes.py:311` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/mathcore/pipeline` | `MathCorePipelineRequest` | `—` | `—` | `trigger_mathcore_pipeline` | `brainiak.old/core/api/admin_routes.py:141` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/admin/recommendation/active` | `—` | `tenant_id: str` | `—` | `get_active_recommendation` | `brainiak.old/core/api/admin_routes.py:285` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/admin/registry/nodes` | `—` | `reload: bool` | `—` | `list_registry_nodes` | `brainiak.old/core/api/admin_routes.py:364` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/admin/telemetry/ingest` | `TelemetryIngestRequest` | `—` | `—` | `ingest_telemetry` | `brainiak.old/core/api/admin_routes.py:234` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/toolhub/health` | `—` | `—` | `—` | `_toolhub_health` | `brainiak.old/core/api/app.py:310` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/tools/call` | `ToolCallRequest` | `—` | `ToolCallResponse` | `_call_tool` | `brainiak.old/core/api/app.py:272` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/tools/list` | `—` | `role: str` | `—` | `_list_tools` | `brainiak.old/core/api/app.py:262` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/crystals/encode` | `—` | `text: str, include_s5: bool` | `—` | `crystals_encode` | `brainiak.old/core/api/crystal_routes.py:265` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/crystals/info` | `—` | `—` | `CrystalInfo` | `crystals_info` | `brainiak.old/core/api/crystal_routes.py:114` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/crystals/lookup` | `—` | `word: str, include_s5: bool` | `CrystalResult` | `crystals_lookup` | `brainiak.old/core/api/crystal_routes.py:121` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/crystals/lookup_batch` | `BatchLookupRequest` | `—` | `—` | `crystals_lookup_batch` | `brainiak.old/core/api/crystal_routes.py:164` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/crystals/nearest` | `NearestRequest` | `—` | `—` | `crystals_nearest` | `brainiak.old/core/api/crystal_routes.py:208` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/health` | `—` | `—` | `HealthResponse` | `health` | `brainiak.old/core/api/routes.py:188` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/request` | `RequestInput` | `—` | `RequestAccepted` | `submit_request` | `brainiak.old/core/api/routes.py:66` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/request/{request_id}/response` | `—` | `request_id: UUID` | `ResponseOutput` | `get_request_response` | `brainiak.old/core/api/routes.py:159` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/request/{request_id}/status` | `—` | `request_id: UUID` | `RequestStatusResponse` | `get_request_status` | `brainiak.old/core/api/routes.py:135` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/audio/inject` | `InjectRequest` | `—` | `—` | `audio_inject` | `brainiak.old/core/api/sensory_routes.py:166` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/audio/upload` | `multipart/form-data ; fichiers: audio: UploadFile` | `source: str, client_ts: float | None` | `—` | `audio_upload` | `brainiak.old/core/api/sensory_routes.py:177` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/events` | `—` | `—` | `—` | `proactive_events` | `brainiak.old/core/api/sensory_routes.py:1568` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/interval` | `_HeartbeatIntervalRequest` | `—` | `—` | `heartbeat_set_interval` | `brainiak.old/core/api/sensory_routes.py:1663` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/ping` | `—` | `—` | `—` | `heartbeat_ping` | `brainiak.old/core/api/sensory_routes.py:1625` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/sleep` | `—` | `—` | `—` | `heartbeat_force_sleep` | `brainiak.old/core/api/sensory_routes.py:1674` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/start` | `—` | `—` | `—` | `heartbeat_start` | `brainiak.old/core/api/sensory_routes.py:1602` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/heartbeat/status` | `—` | `—` | `—` | `heartbeat_status` | `brainiak.old/core/api/sensory_routes.py:1632` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/stop` | `—` | `—` | `—` | `heartbeat_stop` | `brainiak.old/core/api/sensory_routes.py:1614` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/heartbeat/tensions` | `—` | `—` | `—` | `heartbeat_tensions` | `brainiak.old/core/api/sensory_routes.py:1694` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/heartbeat/wake` | `—` | `—` | `—` | `heartbeat_force_wake` | `brainiak.old/core/api/sensory_routes.py:1685` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/sensory/config` | `—` | `—` | `—` | `get_config` | `brainiak.old/core/api/sensory_routes.py:353` |
| LEGACY_NON_MONTE | LEGACY / non montée | PATCH | `/v1/sensory/config` | `ConfigPatch` | `—` | `—` | `patch_config` | `brainiak.old/core/api/sensory_routes.py:361` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/sensory/devices` | `—` | `—` | `—` | `get_devices` | `brainiak.old/core/api/sensory_routes.py:372` |
| LEGACY_NON_MONTE | LEGACY / non montée | PUT | `/v1/sensory/devices/routing` | `DeviceRouting` | `—` | `—` | `set_routing` | `brainiak.old/core/api/sensory_routes.py:432` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/sensory/state` | `—` | `—` | `—` | `sensory_state` | `brainiak.old/core/api/sensory_routes.py:259` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/system/checkup` | `—` | `scale: str, category: str | None` | `—` | `system_checkup` | `brainiak.old/core/api/sensory_routes.py:444` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/system/diagnose` | `—` | `—` | `—` | `system_diagnose` | `brainiak.old/core/api/sensory_routes.py:452` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/teaching/status` | `—` | `—` | `—` | `teaching_status` | `brainiak.old/core/api/sensory_routes.py:1732` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/tokenless_mode` | `dict` | `—` | `—` | `set_tokenless_mode` | `brainiak.old/core/api/sensory_routes.py:55` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/vision/frame` | `multipart/form-data ; fichiers: image: UploadFile` | `source: str, client_ts: float | None` | `—` | `vision_frame` | `brainiak.old/core/api/sensory_routes.py:214` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/voice/last.wav` | `—` | `—` | `—` | `voice_last_wav` | `brainiak.old/core/api/sensory_routes.py:156` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/voice/speak` | `SpeakRequest` | `—` | `—` | `voice_speak` | `brainiak.old/core/api/sensory_routes.py:98` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching` | `—` | `—` | `—` | `teaching_dashboard` | `brainiak.old/core/api/teaching_routes.py:1318` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/audio/{word}` | `—` | `word: str, voice: str` | `—` | `teaching_audio` | `brainiak.old/core/api/teaching_routes.py:344` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/crystallize` | `query/form params` | `target: str, reward: float` | `—` | `teaching_crystallize_endpoint` | `brainiak.old/core/api/teaching_routes.py:1180` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/crystallize_primitive` | `PrimitiveCrystallizeRequest` | `—` | `—` | `teaching_crystallize_primitive` | `brainiak.old/core/api/teaching_routes.py:1203` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/edit-def` | `EditDefRequest` | `—` | `—` | `edit_definition` | `brainiak.old/core/api/teaching_routes.py:464` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/encode` | `query/form params` | `target: str, show_image: bool` | `—` | `teaching_encode` | `brainiak.old/core/api/teaching_routes.py:1138` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/events` | `—` | `—` | `—` | `teaching_events` | `brainiak.old/core/api/teaching_routes.py:181` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/exercise` | `—` | `word: str | None` | `—` | `get_exercise` | `brainiak.old/core/api/teaching_routes.py:431` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/flush` | `—` | `—` | `—` | `teaching_flush` | `brainiak.old/core/api/teaching_routes.py:1295` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/image/{word}` | `—` | `word: str` | `—` | `teaching_image` | `brainiak.old/core/api/teaching_routes.py:332` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/mode` | `ModeRequest` | `—` | `—` | `set_mode` | `brainiak.old/core/api/teaching_routes.py:383` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/navigate` | `query/form params` | `action: str` | `—` | `navigate` | `brainiak.old/core/api/teaching_routes.py:395` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/phase` | `query/form params` | `phase: str` | `—` | `switch_phase` | `brainiak.old/core/api/teaching_routes.py:419` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/reinforce` | `ReinforceRequest` | `—` | `—` | `manual_reinforce` | `brainiak.old/core/api/teaching_routes.py:477` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/teach` | `query/form params` | `stimulus: str, target: str, show_image: bool` | `—` | `teaching_trial` | `brainiak.old/core/api/teaching_routes.py:1247` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/upload` | `multipart/form-data ; fichiers: file: UploadFile` | `source: str` | `—` | `upload_teaching_file` | `brainiak.old/core/api/teaching_routes.py:498` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/teaching/verify` | `query/form params` | `target: str` | `—` | `teaching_verify` | `brainiak.old/core/api/teaching_routes.py:1163` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/weights` | `—` | `—` | `—` | `teaching_weights` | `brainiak.old/core/api/teaching_routes.py:235` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/teaching/weights/detail` | `—` | `—` | `—` | `teaching_weights_detail` | `brainiak.old/core/api/teaching_routes.py:301` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/ui` | `—` | `—` | `—` | `serve_ui` | `brainiak.old/core/api/ui_routes.py:1963` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/ui/files` | `—` | `path: str` | `—` | `list_files` | `brainiak.old/core/api/ui_routes.py:44` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/bootstrap` | `query/form params` | `level: int` | `—` | `bootstrap_nelson` | `brainiak.old/core/api/v1_routes.py:923` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/diagnose` | `—` | `text: str` | `—` | `diagnose_text` | `brainiak.old/core/api/v1_routes.py:661` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/feedback` | `FeedbackRequest` | `—` | `—` | `self_learning_feedback` | `brainiak.old/core/api/v1_routes.py:546` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/feedback-sense` | `FeedbackSenseRequest` | `—` | `—` | `feedback_sense` | `brainiak.old/core/api/v1_routes.py:634` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/learning-status` | `—` | `—` | `—` | `learning_status` | `brainiak.old/core/api/v1_routes.py:675` |
| LEGACY_NON_MONTE | LEGACY / non montée | DELETE | `/v1/modes` | `—` | `—` | `—` | `reset_modes` | `brainiak.old/core/api/v1_routes.py:1119` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/modes` | `—` | `—` | `—` | `get_modes` | `brainiak.old/core/api/v1_routes.py:1064` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/modes` | `dict` | `—` | `—` | `set_modes` | `brainiak.old/core/api/v1_routes.py:1103` |
| LEGACY_NON_MONTE | LEGACY / non montée | DELETE | `/v1/modes/{mode_name}` | `—` | `mode_name: str` | `—` | `deactivate_mode` | `brainiak.old/core/api/v1_routes.py:1094` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/modes/{mode_name}` | `query/form params` | `mode_name: str` | `—` | `activate_mode` | `brainiak.old/core/api/v1_routes.py:1082` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/production/save` | `—` | `—` | `—` | `save_production` | `brainiak.old/core/api/v1_routes.py:968` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/prompt` | `PromptRequest` | `—` | `—` | `unified_prompt` | `brainiak.old/core/api/v1_routes.py:464` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/prompt/control/{request_id}` | `PipelineControlRequest` | `request_id: str` | `—` | `pipeline_control` | `brainiak.old/core/api/v1_routes.py:1040` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/reinforce` | `ReinforceRequest` | `—` | `—` | `reinforce` | `brainiak.old/core/api/v1_routes.py:752` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/reinforcement-config` | `—` | `—` | `—` | `get_reinforcement_config` | `brainiak.old/core/api/v1_routes.py:847` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/reinforcement-config` | `ReinforcementConfigRequest` | `—` | `—` | `set_reinforcement_config` | `brainiak.old/core/api/v1_routes.py:818` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/reinforcement-config/load-valence` | `—` | `—` | `—` | `load_valence` | `brainiak.old/core/api/v1_routes.py:875` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/reinforcement-config/save-valence` | `—` | `—` | `—` | `save_valence` | `brainiak.old/core/api/v1_routes.py:867` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/reset-feedback` | `—` | `—` | `—` | `reset_feedback_state` | `brainiak.old/core/api/v1_routes.py:727` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/skinner` | `SkinnerRequest` | `—` | `—` | `skinner_feedback` | `brainiak.old/core/api/v1_routes.py:1136` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/teach` | `TeachRequest` | `—` | `—` | `teach_word` | `brainiak.old/core/api/v1_routes.py:584` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/teach-contrastive` | `TeachContrastiveRequest` | `—` | `—` | `teach_contrastive` | `brainiak.old/core/api/v1_routes.py:604` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/tokenless` | `—` | `—` | `—` | `get_tokenless_status` | `brainiak.old/core/api/v1_routes.py:715` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/tokenless` | `query/form params` | `enable: bool` | `—` | `toggle_tokenless` | `brainiak.old/core/api/v1_routes.py:698` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/weights/save` | `—` | `—` | `—` | `save_weights` | `brainiak.old/core/api/v1_routes.py:1006` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/health` | `—` | `—` | `—` | `health` | `brainiak.old/tool_hub/main.py:146` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v1/tools/call` | `ToolCallRequest` | `—` | `ToolCallResponse` | `call_tool` | `brainiak.old/tool_hub/main.py:103` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v1/tools/list` | `—` | `role: str` | `—` | `list_tools` | `brainiak.old/tool_hub/main.py:92` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/dev/chat` | `DevChatRequest` | `—` | `DevChatResponse` | `dev_chat` | `brainiak/core/api/dev_routes_legacy_v4.py:818` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/dev/chat/async` | `DevChatRequest` | `—` | `—` | `dev_chat_async_submit` | `brainiak/core/api/dev_routes_legacy_v4.py:839` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/dev/chat/stream` | `DevChatRequest` | `—` | `—` | `dev_chat_stream` | `brainiak/core/api/dev_routes_legacy_v4.py:855` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/dev/chat/{job_id}/result` | `—` | `job_id: str` | `DevChatResponse` | `dev_chat_job_result` | `brainiak/core/api/dev_routes_legacy_v4.py:1110` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/dev/chat/{job_id}/status` | `—` | `job_id: str` | `DevJobStatus` | `dev_chat_job_status` | `brainiak/core/api/dev_routes_legacy_v4.py:1095` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/dev/mathcore/gamma` | `—` | `—` | `—` | `mathcore_gamma` | `brainiak/core/api/dev_routes_legacy_v4.py:1124` |
| LEGACY_NON_MONTE | LEGACY / non montée | DELETE | `/v0/dev/session` | `—` | `session_id: str` | `—` | `clear_session` | `brainiak/core/api/dev_routes_legacy_v4.py:444` |
| LEGACY_NON_MONTE | LEGACY / non montée | GET | `/v0/dev/session` | `—` | `session_id: str` | `—` | `get_session` | `brainiak/core/api/dev_routes_legacy_v4.py:424` |
| LEGACY_NON_MONTE | LEGACY / non montée | POST | `/v0/dev/session/messages` | `_AppendSessionBody` | `session_id: str` | `—` | `append_session_messages` | `brainiak/core/api/dev_routes_legacy_v4.py:430` |

## Appels détaillés — Core actif
### `GET /health`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `health`
- Source : `brainiak/core/api/routes.py:188`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `HealthResponse`
- Note handler : Healthcheck endpoint.
```bash
curl -X GET "$BASE/health"
```
### `GET /lawer`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `lawer_page`
- Source : `brainiak/core/api/lawer_routes.py:47`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve the LAWER SPA page from static file.
```bash
curl -X GET "$BASE/lawer"
```
### `POST /lawer/chat`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `lawer_chat`
- Source : `brainiak/core/api/lawer_routes.py:154`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Chat assistance for SPA generation.
```bash
curl -X POST "$BASE/lawer/chat"
```
### `POST /lawer/generate`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `generate_spa`
- Source : `brainiak/core/api/lawer_routes.py:93`
- Paramètres : `fields: Dict[str, Any]`
- Body / Form : `Dict[str, Any]`
- Response model : `—`
- Note handler : Generate SPA from validated fields.
```bash
curl -X POST "$BASE/lawer/generate?fields=..." -H 'Content-Type: application/json' -d '{"...": "Dict[str, Any]"}'
```
### `POST /lawer/parse`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `parse_loi`
- Source : `brainiak/core/api/lawer_routes.py:56`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Parse LOI text and extract structured fields.
```bash
curl -X POST "$BASE/lawer/parse"
```
### `POST /lawer/save-template`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `save_template`
- Source : `brainiak/core/api/lawer_routes.py:213`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Save current fields as a template.
```bash
curl -X POST "$BASE/lawer/save-template"
```
### `GET /lawer/templates`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `list_templates`
- Source : `brainiak/core/api/lawer_routes.py:246`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : List all saved templates.
```bash
curl -X GET "$BASE/lawer/templates"
```
### `GET /lawer/templates/{name}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `load_template`
- Source : `brainiak/core/api/lawer_routes.py:261`
- Paramètres : `name: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Load a specific template by name.
```bash
curl -X GET "$BASE/lawer/templates/EXAMPLE_name"
```
### `GET /teaching`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_dashboard`
- Source : `brainiak/core/api/teaching_routes.py:1318`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve the Teaching Dashboard SPA.
```bash
curl -X GET "$BASE/teaching"
```
### `GET /teaching/audio/{word}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_audio`
- Source : `brainiak/core/api/teaching_routes.py:344`
- Paramètres : `word: str, voice: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Generate or serve cached TTS audio for a word with selected voice.
```bash
curl -X GET "$BASE/teaching/audio/EXAMPLE_word?voice=..."
```
### `POST /teaching/crystallize`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_crystallize_endpoint`
- Source : `brainiak/core/api/teaching_routes.py:1180`
- Paramètres : `target: str, reward: float`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Crystallize a T^n concept independently. No reinforcement.
```bash
curl -X POST "$BASE/teaching/crystallize?target=...&reward=..."
```
### `POST /teaching/crystallize_primitive`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_crystallize_primitive`
- Source : `brainiak/core/api/teaching_routes.py:1203`
- Paramètres : `—`
- Body / Form : `PrimitiveCrystallizeRequest`
- Response model : `—`
- Note handler : Crystallize a grammatical primitive (NEGATOR, POS_CATEGORY, ...).
```bash
curl -X POST "$BASE/teaching/crystallize_primitive" -H 'Content-Type: application/json' -d '{"target": "string", "primitive_type": "string", "grammar_slots": {}, "reward": 1.0}'
```
Modèle `PrimitiveCrystallizeRequest` :
```json
{
  "target": "string",
  "primitive_type": "string",
  "grammar_slots": {},
  "reward": 1.0
}
```
### `POST /teaching/edit-def`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `edit_definition`
- Source : `brainiak/core/api/teaching_routes.py:464`
- Paramètres : `—`
- Body / Form : `EditDefRequest`
- Response model : `—`
- Note handler : Override a word definition for teaching.
```bash
curl -X POST "$BASE/teaching/edit-def" -H 'Content-Type: application/json' -d '{"word": "string", "definition": "string"}'
```
Modèle `EditDefRequest` :
```json
{
  "word": "string",
  "definition": "string"
}
```
### `POST /teaching/encode`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_encode`
- Source : `brainiak/core/api/teaching_routes.py:1138`
- Paramètres : `target: str, show_image: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Encode a word/phrase → T^n + R^14 + optional R^6_vis/R^6_aud.
```bash
curl -X POST "$BASE/teaching/encode?target=...&show_image=..."
```
### `GET /teaching/events`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_events`
- Source : `brainiak/core/api/teaching_routes.py:181`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : SSE stream of teaching events.
```bash
curl -X GET "$BASE/teaching/events"
```
### `GET /teaching/exercise`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_exercise`
- Source : `brainiak/core/api/teaching_routes.py:431`
- Paramètres : `word: str | None`
- Body / Form : `—`
- Response model : `—`
- Note handler : Get current exercise, or a specific word's exercise.
```bash
curl -X GET "$BASE/teaching/exercise?word=..."
```
### `POST /teaching/flush`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_flush`
- Source : `brainiak/core/api/teaching_routes.py:1295`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force-save crystallized T^n and learning weights to disk.
```bash
curl -X POST "$BASE/teaching/flush"
```
### `GET /teaching/image/{word}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_image`
- Source : `brainiak/core/api/teaching_routes.py:332`
- Paramètres : `word: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve imagier image for a word (ARASAAC pictograms = PNG).
```bash
curl -X GET "$BASE/teaching/image/EXAMPLE_word"
```
### `POST /teaching/mode`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `set_mode`
- Source : `brainiak/core/api/teaching_routes.py:383`
- Paramètres : `—`
- Body / Form : `ModeRequest`
- Response model : `—`
- Note handler : Switch teaching mode.
```bash
curl -X POST "$BASE/teaching/mode" -H 'Content-Type: application/json' -d '{"mode": "string"}'
```
Modèle `ModeRequest` :
```json
{
  "mode": "string"
}
```
### `POST /teaching/navigate`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `navigate`
- Source : `brainiak/core/api/teaching_routes.py:395`
- Paramètres : `action: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Navigate exercises in teacher mode. action: next|prev|skip|repeat
```bash
curl -X POST "$BASE/teaching/navigate?action=..."
```
### `POST /teaching/phase`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `switch_phase`
- Source : `brainiak/core/api/teaching_routes.py:419`
- Paramètres : `phase: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Switch lexicon phase: phase2 (single words) or phase3 (compositions).
```bash
curl -X POST "$BASE/teaching/phase?phase=..."
```
### `POST /teaching/reinforce`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `manual_reinforce`
- Source : `brainiak/core/api/teaching_routes.py:477`
- Paramètres : `—`
- Body / Form : `ReinforceRequest`
- Response model : `—`
- Note handler : Manual reinforcement — wraps /v1/reinforce + publishes SSE event.
```bash
curl -X POST "$BASE/teaching/reinforce" -H 'Content-Type: application/json' -d '{"type": "string", "intensity": 1.0, "target": "string", "correction_text": "string", "emotion_context": "string"}'
```
Modèle `ReinforceRequest` :
```json
{
  "type": "string",
  "intensity": 1.0,
  "target": "string",
  "correction_text": "string",
  "emotion_context": "string"
}
```
### `POST /teaching/teach`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_trial`
- Source : `brainiak/core/api/teaching_routes.py:1247`
- Paramètres : `stimulus: str, target: str, show_image: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Run a single DTT trial — orchestrator calling sub-functions.
```bash
curl -X POST "$BASE/teaching/teach?stimulus=...&target=...&show_image=..."
```
### `POST /teaching/upload`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `upload_teaching_file`
- Source : `brainiak/core/api/teaching_routes.py:498`
- Paramètres : `source: str`
- Body / Form : `multipart/form-data ; fichiers: file: UploadFile`
- Response model : `—`
- Note handler : Upload an image/audio/video file for free-mode teaching.
```bash
curl -X POST "$BASE/teaching/upload?source=..." -F 'file=@/path/file' -F 'source=...'
```
### `POST /teaching/verify`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_verify`
- Source : `brainiak/core/api/teaching_routes.py:1163`
- Paramètres : `target: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Verify composition + roles for a phrase. No reinforcement.
```bash
curl -X POST "$BASE/teaching/verify?target=..."
```
### `GET /teaching/weights`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_weights`
- Source : `brainiak/core/api/teaching_routes.py:235`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Snapshot of all 12 learnable matrices — for 3D surface visualization.
```bash
curl -X GET "$BASE/teaching/weights"
```
### `GET /teaching/weights/detail`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teaching_weights_detail`
- Source : `brainiak/core/api/teaching_routes.py:301`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Detailed weight matrices — per-row/col norms for heterogeneity check.
```bash
curl -X GET "$BASE/teaching/weights/detail"
```
### `GET /toolhub/health`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `_toolhub_health`
- Source : `brainiak/core/api/app.py:312`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/toolhub/health"
```
### `GET /ui`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `serve_ui`
- Source : `brainiak/core/api/ui_routes.py:1963`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve the BrainiaK Think single-page application.
```bash
curl -X GET "$BASE/ui"
```
### `GET /ui/files`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `list_files`
- Source : `brainiak/core/api/ui_routes.py:44`
- Paramètres : `path: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : List files and directories in the given path.
```bash
curl -X GET "$BASE/ui/files?path=..."
```
### `POST /v0/admin/aggregate/daily`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `trigger_daily_aggregate`
- Source : `brainiak/core/api/admin_routes.py:89`
- Paramètres : `—`
- Body / Form : `DailyAggregateRequest`
- Response model : `—`
- Note handler : Trigger DailyAggregator for the given date.
```bash
curl -X POST "$BASE/v0/admin/aggregate/daily" -H 'Content-Type: application/json' -d '{"date": "string"}'
```
Modèle `DailyAggregateRequest` :
```json
{
  "date": "string"
}
```
### `POST /v0/admin/aggregate/weekly`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `trigger_weekly_aggregate`
- Source : `brainiak/core/api/admin_routes.py:115`
- Paramètres : `—`
- Body / Form : `WeeklyAggregateRequest`
- Response model : `—`
- Note handler : Trigger WeeklyAggregator for the week starting on week_start.
```bash
curl -X POST "$BASE/v0/admin/aggregate/weekly" -H 'Content-Type: application/json' -d '{"week_start": "string"}'
```
Modèle `WeeklyAggregateRequest` :
```json
{
  "week_start": "string"
}
```
### `POST /v0/admin/batch/nightly`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `trigger_nightly_batch`
- Source : `brainiak/core/api/admin_routes.py:176`
- Paramètres : `—`
- Body / Form : `NightlyBatchRequest`
- Response model : `—`
- Note handler : Trigger the full nightly batch: daily → weekly → MathCore pipeline → warmup.
```bash
curl -X POST "$BASE/v0/admin/batch/nightly" -H 'Content-Type: application/json' -d '{"date": "string"}'
```
Modèle `NightlyBatchRequest` :
```json
{
  "date": "string"
}
```
### `POST /v0/admin/bootstrap/calibrate`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `bootstrap_calibrate`
- Source : `brainiak/core/api/admin_routes.py:345`
- Paramètres : `—`
- Body / Form : `BootstrapRunRequest`
- Response model : `—`
- Note handler : Run one calibration step for a tenant (manual trigger).
```bash
curl -X POST "$BASE/v0/admin/bootstrap/calibrate" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "n_runs": 1}'
```
Modèle `BootstrapRunRequest` :
```json
{
  "tenant_id": "string",
  "n_runs": 1
}
```
### `POST /v0/admin/bootstrap/run`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `bootstrap_run`
- Source : `brainiak/core/api/admin_routes.py:323`
- Paramètres : `—`
- Body / Form : `BootstrapRunRequest`
- Response model : `—`
- Note handler : Run the bootstrap pipeline for a tenant.
```bash
curl -X POST "$BASE/v0/admin/bootstrap/run" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "n_runs": 1}'
```
Modèle `BootstrapRunRequest` :
```json
{
  "tenant_id": "string",
  "n_runs": 1
}
```
### `GET /v0/admin/bootstrap/status`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `bootstrap_status`
- Source : `brainiak/core/api/admin_routes.py:311`
- Paramètres : `tenant_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Check initial conditions (CI gate) for a tenant.
```bash
curl -X GET "$BASE/v0/admin/bootstrap/status?tenant_id=..."
```
### `POST /v0/admin/mathcore/pipeline`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `trigger_mathcore_pipeline`
- Source : `brainiak/core/api/admin_routes.py:141`
- Paramètres : `—`
- Body / Form : `MathCorePipelineRequest`
- Response model : `—`
- Note handler : Trigger full MathCore pipeline: FFS → MixMod → Drift Detection.
```bash
curl -X POST "$BASE/v0/admin/mathcore/pipeline" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "date": "string"}'
```
Modèle `MathCorePipelineRequest` :
```json
{
  "tenant_id": "string",
  "date": "string"
}
```
### `GET /v0/admin/recommendation/active`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `get_active_recommendation`
- Source : `brainiak/core/api/admin_routes.py:285`
- Paramètres : `tenant_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Get current MathCore recommendations for a tenant.
```bash
curl -X GET "$BASE/v0/admin/recommendation/active?tenant_id=..."
```
### `GET /v0/admin/registry/nodes`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `list_registry_nodes`
- Source : `brainiak/core/api/admin_routes.py:364`
- Paramètres : `reload: bool`
- Body / Form : `—`
- Response model : `—`
- Note handler : List all entries in node_registry.
```bash
curl -X GET "$BASE/v0/admin/registry/nodes?reload=..."
```
### `POST /v0/admin/telemetry/ingest`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `ingest_telemetry`
- Source : `brainiak/core/api/admin_routes.py:234`
- Paramètres : `—`
- Body / Form : `TelemetryIngestRequest`
- Response model : `—`
- Note handler : Ingest telemetry events from external sources (scripts, edge tools).
```bash
curl -X POST "$BASE/v0/admin/telemetry/ingest" -H 'Content-Type: application/json' -d '{"events": [], "tenant_id": "string"}'
```
Modèle `TelemetryIngestRequest` :
```json
{
  "events": [],
  "tenant_id": "string"
}
```
### `POST /v0/dev/chat`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `dev_chat`
- Source : `brainiak/core/api/dev_routes.py:780`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `DevChatResponse`
- Note handler : Dev agent chat endpoint — synchronous tool-calling loop.
```bash
curl -X POST "$BASE/v0/dev/chat" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `POST /v0/dev/chat/async`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `dev_chat_async_submit`
- Source : `brainiak/core/api/dev_routes.py:801`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `—`
- Note handler : Async dev agent — submit job, return job_id immediately.
```bash
curl -X POST "$BASE/v0/dev/chat/async" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `POST /v0/dev/chat/stream`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `dev_chat_stream`
- Source : `brainiak/core/api/dev_routes.py:817`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `—`
- Note handler : SSE streaming dev agent — single HTTP connection, real-time events.
```bash
curl -X POST "$BASE/v0/dev/chat/stream" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `GET /v0/dev/chat/{job_id}/result`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `dev_chat_job_result`
- Source : `brainiak/core/api/dev_routes.py:1061`
- Paramètres : `job_id: str`
- Body / Form : `—`
- Response model : `DevChatResponse`
- Note handler : Fetch completed async job result.
```bash
curl -X GET "$BASE/v0/dev/chat/EXAMPLE_job_id/result"
```
### `GET /v0/dev/chat/{job_id}/status`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `dev_chat_job_status`
- Source : `brainiak/core/api/dev_routes.py:1046`
- Paramètres : `job_id: str`
- Body / Form : `—`
- Response model : `DevJobStatus`
- Note handler : Poll async job status (Postgres-backed, survives reload).
```bash
curl -X GET "$BASE/v0/dev/chat/EXAMPLE_job_id/status"
```
### `GET /v0/dev/mathcore/gamma`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `mathcore_gamma`
- Source : `brainiak/core/api/dev_routes.py:1075`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Expose the Gamma externality matrix — BrainiaK's inter-node correlation structure.
```bash
curl -X GET "$BASE/v0/dev/mathcore/gamma"
```
### `DELETE /v0/dev/session`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `clear_session`
- Source : `brainiak/core/api/dev_routes.py:396`
- Paramètres : `session_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Clear session history.
```bash
curl -X DELETE "$BASE/v0/dev/session?session_id=..."
```
### `GET /v0/dev/session`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_session`
- Source : `brainiak/core/api/dev_routes.py:376`
- Paramètres : `session_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Return stored message history for a session (UI restore on page load).
```bash
curl -X GET "$BASE/v0/dev/session?session_id=..."
```
### `POST /v0/dev/session/messages`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `append_session_messages`
- Source : `brainiak/core/api/dev_routes.py:382`
- Paramètres : `session_id: str`
- Body / Form : `_AppendSessionBody`
- Response model : `—`
- Note handler : Append messages to session history (called after each exchange).
```bash
curl -X POST "$BASE/v0/dev/session/messages?session_id=..." -H 'Content-Type: application/json' -d '{"messages": []}'
```
Modèle `_AppendSessionBody` :
```json
{
  "messages": []
}
```
### `POST /v0/request`
- Statut : **ACTIF_CORE**
- Type : **Hybride API client↔Core**
- Handler : `submit_request`
- Source : `brainiak/core/api/routes.py:66`
- Paramètres : `—`
- Body / Form : `RequestInput`
- Response model : `RequestAccepted`
- Note handler : Submit a new request to the BrainiaK pipeline.
```bash
curl -X POST "$BASE/v0/request" -H 'Content-Type: application/json' -d '{"...": "RequestInput"}'
```
### `GET /v0/request/{request_id}/response`
- Statut : **ACTIF_CORE**
- Type : **Hybride API client↔Core**
- Handler : `get_request_response`
- Source : `brainiak/core/api/routes.py:159`
- Paramètres : `request_id: UUID`
- Body / Form : `—`
- Response model : `ResponseOutput`
- Note handler : Retrieve the completed ResponseOutput for a request.
```bash
curl -X GET "$BASE/v0/request/EXAMPLE_request_id/response"
```
### `GET /v0/request/{request_id}/status`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `get_request_status`
- Source : `brainiak/core/api/routes.py:135`
- Paramètres : `request_id: UUID`
- Body / Form : `—`
- Response model : `RequestStatusResponse`
- Note handler : Get the current status of a request.
```bash
curl -X GET "$BASE/v0/request/EXAMPLE_request_id/status"
```
### `POST /v1/audio/inject`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `audio_inject`
- Source : `brainiak/core/api/sensory_routes.py:166`
- Paramètres : `—`
- Body / Form : `InjectRequest`
- Response model : `—`
- Note handler : Inject R^6_aud vector directly into AuditoryEngine.
```bash
curl -X POST "$BASE/v1/audio/inject" -H 'Content-Type: application/json' -d '{"vector": 1.0, "source_tag": "string", "client_ts": 1.0}'
```
Modèle `InjectRequest` :
```json
{
  "vector": 1.0,
  "source_tag": "string",
  "client_ts": 1.0
}
```
### `POST /v1/audio/upload`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `audio_upload`
- Source : `brainiak/core/api/sensory_routes.py:177`
- Paramètres : `source: str, client_ts: float | None`
- Body / Form : `multipart/form-data ; fichiers: audio: UploadFile`
- Response model : `—`
- Note handler : Upload audio chunk (WAV/PCM) → AuditoryEngine.
```bash
curl -X POST "$BASE/v1/audio/upload?source=...&client_ts=..." -F 'audio=@/path/file' -F 'source=...' -F 'client_ts=...'
```
### `POST /v1/bootstrap`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `bootstrap_nelson`
- Source : `brainiak/core/api/v1_routes.py:929`
- Paramètres : `level: int`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Seed reinforcement valence with Nelson vocabulary tiers.
```bash
curl -X POST "$BASE/v1/bootstrap?level=..."
```
### `GET /v1/crystals/encode`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `crystals_encode`
- Source : `brainiak/core/api/crystal_routes.py:265`
- Paramètres : `text: str, include_s5: bool`
- Body / Form : `—`
- Response model : `—`
- Note handler : Encode un texte → résumé T^n : R^14 moyen + S^5 des mots cristallisés.
```bash
curl -X GET "$BASE/v1/crystals/encode?text=...&include_s5=..."
```
### `GET /v1/crystals/info`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `crystals_info`
- Source : `brainiak/core/api/crystal_routes.py:114`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `CrystalInfo`
- Note handler : Stats du store : nombre de cristaux, chemin, timestamp de chargement.
```bash
curl -X GET "$BASE/v1/crystals/info"
```
### `GET /v1/crystals/lookup`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `crystals_lookup`
- Source : `brainiak/core/api/crystal_routes.py:121`
- Paramètres : `word: str, include_s5: bool`
- Body / Form : `—`
- Response model : `CrystalResult`
- Note handler : Retourne le cristal T^n complet pour un mot donné.
```bash
curl -X GET "$BASE/v1/crystals/lookup?word=...&include_s5=..."
```
### `POST /v1/crystals/lookup_batch`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `crystals_lookup_batch`
- Source : `brainiak/core/api/crystal_routes.py:164`
- Paramètres : `—`
- Body / Form : `BatchLookupRequest`
- Response model : `—`
- Note handler : Lookup de plusieurs mots en une requête.
```bash
curl -X POST "$BASE/v1/crystals/lookup_batch" -H 'Content-Type: application/json' -d '{"words": "string", "include_s5": true}'
```
Modèle `BatchLookupRequest` :
```json
{
  "words": "string",
  "include_s5": true
}
```
### `POST /v1/crystals/nearest`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `crystals_nearest`
- Source : `brainiak/core/api/crystal_routes.py:208`
- Paramètres : `—`
- Body / Form : `NearestRequest`
- Response model : `—`
- Note handler : K plus proches voisins d'un vecteur R^14 dans le store.
```bash
curl -X POST "$BASE/v1/crystals/nearest" -H 'Content-Type: application/json' -d '{"r14": 1.0, "k": 1, "socle": "string"}'
```
Modèle `NearestRequest` :
```json
{
  "r14": 1.0,
  "k": 1,
  "socle": "string"
}
```
### `GET /v1/diagnose`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `diagnose_text`
- Source : `brainiak/core/api/v1_routes.py:667`
- Paramètres : `text: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Diagnose how BrainiaK reads a text.
```bash
curl -X GET "$BASE/v1/diagnose?text=..."
```
### `GET /v1/events`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `proactive_events`
- Source : `brainiak/core/api/sensory_routes.py:1568`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : SSE stream for proactive messages from BrainiaK.
```bash
curl -X GET "$BASE/v1/events"
```
### `POST /v1/feedback`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `self_learning_feedback`
- Source : `brainiak/core/api/v1_routes.py:552`
- Paramètres : `—`
- Body / Form : `FeedbackRequest`
- Response model : `—`
- Note handler : Human feedback for self-learning.
```bash
curl -X POST "$BASE/v1/feedback" -H 'Content-Type: application/json' -d '{"verdict": "string", "word": "string", "text": "string", "session_id": "string"}'
```
Modèle `FeedbackRequest` :
```json
{
  "verdict": "string",
  "word": "string",
  "text": "string",
  "session_id": "string"
}
```
### `POST /v1/feedback-sense`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `feedback_sense`
- Source : `brainiak/core/api/v1_routes.py:640`
- Paramètres : `—`
- Body / Form : `FeedbackSenseRequest`
- Response model : `—`
- Note handler : Feedback on a specific sense of a polysemous word.
```bash
curl -X POST "$BASE/v1/feedback-sense" -H 'Content-Type: application/json' -d '{"word": "string", "sense_label": "string", "verdict": "string", "context_sentence": "string", "session_id": "string"}'
```
Modèle `FeedbackSenseRequest` :
```json
{
  "word": "string",
  "sense_label": "string",
  "verdict": "string",
  "context_sentence": "string",
  "session_id": "string"
}
```
### `POST /v1/heartbeat/interval`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_set_interval`
- Source : `brainiak/core/api/sensory_routes.py:1663`
- Paramètres : `—`
- Body / Form : `_HeartbeatIntervalRequest`
- Response model : `—`
- Note handler : Set heartbeat interval manually. 0 = auto (CES regime).
```bash
curl -X POST "$BASE/v1/heartbeat/interval" -H 'Content-Type: application/json' -d '{"interval": 1.0}'
```
Modèle `_HeartbeatIntervalRequest` :
```json
{
  "interval": 1.0
}
```
### `POST /v1/heartbeat/ping`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_ping`
- Source : `brainiak/core/api/sensory_routes.py:1625`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Mark that someone is interacting with BrainiaK.
```bash
curl -X POST "$BASE/v1/heartbeat/ping"
```
### `POST /v1/heartbeat/sleep`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_force_sleep`
- Source : `brainiak/core/api/sensory_routes.py:1674`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force enter sleep mode (for testing / manual consolidation).
```bash
curl -X POST "$BASE/v1/heartbeat/sleep"
```
### `POST /v1/heartbeat/start`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_start`
- Source : `brainiak/core/api/sensory_routes.py:1602`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Start BrainiaK's autonomous heartbeat.
```bash
curl -X POST "$BASE/v1/heartbeat/start"
```
### `GET /v1/heartbeat/status`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `heartbeat_status`
- Source : `brainiak/core/api/sensory_routes.py:1632`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current heartbeat state + recent activity log.
```bash
curl -X GET "$BASE/v1/heartbeat/status"
```
### `POST /v1/heartbeat/stop`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_stop`
- Source : `brainiak/core/api/sensory_routes.py:1614`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Stop BrainiaK's heartbeat.
```bash
curl -X POST "$BASE/v1/heartbeat/stop"
```
### `GET /v1/heartbeat/tensions`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_tensions`
- Source : `brainiak/core/api/sensory_routes.py:1694`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Inspect the tension queue.
```bash
curl -X GET "$BASE/v1/heartbeat/tensions"
```
### `POST /v1/heartbeat/wake`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `heartbeat_force_wake`
- Source : `brainiak/core/api/sensory_routes.py:1685`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force wake up from sleep mode.
```bash
curl -X POST "$BASE/v1/heartbeat/wake"
```
### `GET /v1/learning-status`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `learning_status`
- Source : `brainiak/core/api/v1_routes.py:681`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current learning status: LearningWeights + SSTD scorer stats.
```bash
curl -X GET "$BASE/v1/learning-status"
```
### `DELETE /v1/modes`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `reset_modes`
- Source : `brainiak/core/api/v1_routes.py:1125`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : DELETE /v1/modes — Reset aux modes par défaut (symbiose_jp uniquement).
```bash
curl -X DELETE "$BASE/v1/modes"
```
### `GET /v1/modes`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_modes`
- Source : `brainiak/core/api/v1_routes.py:1070`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : GET /v1/modes — Status des modes actifs + liste disponible.
```bash
curl -X GET "$BASE/v1/modes"
```
### `POST /v1/modes`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `set_modes`
- Source : `brainiak/core/api/v1_routes.py:1109`
- Paramètres : `—`
- Body / Form : `dict`
- Response model : `—`
- Note handler : POST /v1/modes — Set les modes actifs (remplace l'état courant).
```bash
curl -X POST "$BASE/v1/modes" -H 'Content-Type: application/json' -d '{"...": "dict"}'
```
### `DELETE /v1/modes/{mode_name}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `deactivate_mode`
- Source : `brainiak/core/api/v1_routes.py:1100`
- Paramètres : `mode_name: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : DELETE /v1/modes/{mode} — Désactive un mode.
```bash
curl -X DELETE "$BASE/v1/modes/EXAMPLE_mode_name"
```
### `POST /v1/modes/{mode_name}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `activate_mode`
- Source : `brainiak/core/api/v1_routes.py:1088`
- Paramètres : `mode_name: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : POST /v1/modes/{mode} — Active un mode (ex: POST /v1/modes/expert_math).
```bash
curl -X POST "$BASE/v1/modes/EXAMPLE_mode_name"
```
### `POST /v1/production/save`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `save_production`
- Source : `brainiak/core/api/v1_routes.py:974`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Save ProductionMemory + LearningWeights + acquired valence.
```bash
curl -X POST "$BASE/v1/production/save"
```
### `POST /v1/prompt`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `unified_prompt`
- Source : `brainiak/core/api/v1_routes.py:467`
- Paramètres : `—`
- Body / Form : `PromptRequest`
- Response model : `—`
- Note handler : Unified BrainiaK v4 endpoint.
```bash
curl -X POST "$BASE/v1/prompt" -H 'Content-Type: application/json' -d '{"content": "string", "messages": [], "session_id": "string", "tenant_id": "string", "force_request": true, "enable_thinking": true, "stream": true, "mode": "string", "max_tokens": 1, "max_turns": 1}'
```
Modèle `PromptRequest` :
```json
{
  "content": "string",
  "messages": [],
  "session_id": "string",
  "tenant_id": "string",
  "force_request": true,
  "enable_thinking": true,
  "stream": true,
  "mode": "string",
  "max_tokens": 1,
  "max_turns": 1
}
```
### `POST /v1/prompt/control/{request_id}`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `pipeline_control`
- Source : `brainiak/core/api/v1_routes.py:1046`
- Paramètres : `request_id: str`
- Body / Form : `PipelineControlRequest`
- Response model : `—`
- Note handler : Signal de contrôle pour un pipeline en cours.
```bash
curl -X POST "$BASE/v1/prompt/control/EXAMPLE_request_id" -H 'Content-Type: application/json' -d '{"action": "string"}'
```
Modèle `PipelineControlRequest` :
```json
{
  "action": "string"
}
```
### `POST /v1/reinforce`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `reinforce`
- Source : `brainiak/core/api/v1_routes.py:758`
- Paramètres : `—`
- Body / Form : `ReinforceRequest`
- Response model : `—`
- Note handler : Apply explicit reinforcement to last tokenless attempt.
```bash
curl -X POST "$BASE/v1/reinforce" -H 'Content-Type: application/json' -d '{"type": "string", "intensity": 1.0, "target": "string", "correction_text": "string", "emotion_context": "string"}'
```
Modèle `ReinforceRequest` :
```json
{
  "type": "string",
  "intensity": 1.0,
  "target": "string",
  "correction_text": "string",
  "emotion_context": "string"
}
```
### `GET /v1/reinforcement-config`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `get_reinforcement_config`
- Source : `brainiak/core/api/v1_routes.py:853`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current behaviorist parameters + state.
```bash
curl -X GET "$BASE/v1/reinforcement-config"
```
### `POST /v1/reinforcement-config`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `set_reinforcement_config`
- Source : `brainiak/core/api/v1_routes.py:824`
- Paramètres : `—`
- Body / Form : `ReinforcementConfigRequest`
- Response model : `—`
- Note handler : Adjust behaviorist parameters in real-time.
```bash
curl -X POST "$BASE/v1/reinforcement-config" -H 'Content-Type: application/json' -d '{"extinction_k": 1.0, "valence_learning_rate": 1.0, "valence_decay": 1.0, "valence_threshold": 1.0}'
```
Modèle `ReinforcementConfigRequest` :
```json
{
  "extinction_k": 1.0,
  "valence_learning_rate": 1.0,
  "valence_decay": 1.0,
  "valence_threshold": 1.0
}
```
### `POST /v1/reinforcement-config/load-valence`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `load_valence`
- Source : `brainiak/core/api/v1_routes.py:881`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Load acquired word valences from disk.
```bash
curl -X POST "$BASE/v1/reinforcement-config/load-valence"
```
### `POST /v1/reinforcement-config/save-valence`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `save_valence`
- Source : `brainiak/core/api/v1_routes.py:873`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Persist acquired word valences to disk.
```bash
curl -X POST "$BASE/v1/reinforcement-config/save-valence"
```
### `POST /v1/reset-feedback`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `reset_feedback_state`
- Source : `brainiak/core/api/v1_routes.py:733`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Clear the last tokenless attempt — next prompt won't be treated as feedback.
```bash
curl -X POST "$BASE/v1/reset-feedback"
```
### `GET /v1/sensory/config`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_config`
- Source : `brainiak/core/api/sensory_routes.py:353`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current NervousSystemConfig (37 tunable params).
```bash
curl -X GET "$BASE/v1/sensory/config"
```
### `PATCH /v1/sensory/config`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `patch_config`
- Source : `brainiak/core/api/sensory_routes.py:361`
- Paramètres : `—`
- Body / Form : `ConfigPatch`
- Response model : `—`
- Note handler : Hot-patch NervousSystemConfig parameters.
```bash
curl -X PATCH "$BASE/v1/sensory/config" -H 'Content-Type: application/json' -d '{"patch": {}}'
```
Modèle `ConfigPatch` :
```json
{
  "patch": {}
}
```
### `GET /v1/sensory/devices`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_devices`
- Source : `brainiak/core/api/sensory_routes.py:372`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : List available sensory devices and current routing.
```bash
curl -X GET "$BASE/v1/sensory/devices"
```
### `PUT /v1/sensory/devices/routing`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `set_routing`
- Source : `brainiak/core/api/sensory_routes.py:432`
- Paramètres : `—`
- Body / Form : `DeviceRouting`
- Response model : `—`
- Note handler : Set active device routing for each sense.
```bash
curl -X PUT "$BASE/v1/sensory/devices/routing" -H 'Content-Type: application/json' -d '{"vision": "string", "audition": "string", "voice_output": "string"}'
```
Modèle `DeviceRouting` :
```json
{
  "vision": "string",
  "audition": "string",
  "voice_output": "string"
}
```
### `GET /v1/sensory/state`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `sensory_state`
- Source : `brainiak/core/api/sensory_routes.py:259`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Full nervous system state: all R^6 vectors, security, curiosity, channels.
```bash
curl -X GET "$BASE/v1/sensory/state"
```
### `POST /v1/skinner`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `skinner_feedback`
- Source : `brainiak/core/api/v1_routes.py:1142`
- Paramètres : `—`
- Body / Form : `SkinnerRequest`
- Response model : `—`
- Note handler : POST /v1/skinner — Feedback Skinner immédiat sur la dernière réponse.
```bash
curl -X POST "$BASE/v1/skinner" -H 'Content-Type: application/json' -d '{"verdict": "string", "response_text": "string", "intensity": 1.0, "note": "string"}'
```
Modèle `SkinnerRequest` :
```json
{
  "verdict": "string",
  "response_text": "string",
  "intensity": 1.0,
  "note": "string"
}
```
### `GET /v1/system/checkup`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `system_checkup`
- Source : `brainiak/core/api/sensory_routes.py:444`
- Paramètres : `scale: str, category: str | None`
- Body / Form : `—`
- Response model : `—`
- Note handler : Run system checkup. scale=macro (binary) or micro (detailed). Optional category filter.
```bash
curl -X GET "$BASE/v1/system/checkup?scale=...&category=..."
```
### `GET /v1/system/diagnose`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `system_diagnose`
- Source : `brainiak/core/api/sensory_routes.py:452`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Auto-diagnostic: macro scan, then micro on non-OK systems. Returns issues + recommendations.
```bash
curl -X GET "$BASE/v1/system/diagnose"
```
### `POST /v1/teach`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teach_word`
- Source : `brainiak/core/api/v1_routes.py:590`
- Paramètres : `—`
- Body / Form : `TeachRequest`
- Response model : `—`
- Note handler : Teach a new word or refine an existing one.
```bash
curl -X POST "$BASE/v1/teach" -H 'Content-Type: application/json' -d '{"word": "string", "definition": "string", "session_id": "string"}'
```
Modèle `TeachRequest` :
```json
{
  "word": "string",
  "definition": "string",
  "session_id": "string"
}
```
### `POST /v1/teach-contrastive`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `teach_contrastive`
- Source : `brainiak/core/api/v1_routes.py:610`
- Paramètres : `—`
- Body / Form : `TeachContrastiveRequest`
- Response model : `—`
- Note handler : Teach a word sense via contrastive pair (WSD self-learning).
```bash
curl -X POST "$BASE/v1/teach-contrastive" -H 'Content-Type: application/json' -d '{"word": "string", "sense_label": "string", "positive_context": "string", "negative_context": "string", "session_id": "string"}'
```
Modèle `TeachContrastiveRequest` :
```json
{
  "word": "string",
  "sense_label": "string",
  "positive_context": "string",
  "negative_context": "string",
  "session_id": "string"
}
```
### `GET /v1/teaching/status`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back / supervision**
- Handler : `teaching_status`
- Source : `brainiak/core/api/sensory_routes.py:1732`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Learning status — v7: bidirectional teacher R^14.
```bash
curl -X GET "$BASE/v1/teaching/status"
```
### `GET /v1/tokenless`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `get_tokenless_status`
- Source : `brainiak/core/api/v1_routes.py:721`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Check tokenless mode status.
```bash
curl -X GET "$BASE/v1/tokenless"
```
### `POST /v1/tokenless`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `toggle_tokenless`
- Source : `brainiak/core/api/v1_routes.py:704`
- Paramètres : `enable: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Toggle tokenless mode — BrainiaK speaks without Qwen.
```bash
curl -X POST "$BASE/v1/tokenless?enable=..."
```
### `POST /v1/tokenless_mode`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `set_tokenless_mode`
- Source : `brainiak/core/api/sensory_routes.py:55`
- Paramètres : `—`
- Body / Form : `dict`
- Response model : `—`
- Note handler : Toggle tokenless mode — when active, P:3 (Qwen) is disabled.
```bash
curl -X POST "$BASE/v1/tokenless_mode" -H 'Content-Type: application/json' -d '{"...": "dict"}'
```
### `POST /v1/tools/call`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `_call_tool`
- Source : `brainiak/core/api/app.py:274`
- Paramètres : `—`
- Body / Form : `ToolCallRequest`
- Response model : `ToolCallResponse`
```bash
curl -X POST "$BASE/v1/tools/call" -H 'Content-Type: application/json' -d '{"tool": "string", "arguments": {}, "role": "string", "forwarded": true}'
```
Modèle `ToolCallRequest` :
```json
{
  "tool": "string",
  "arguments": {},
  "role": "string",
  "forwarded": true
}
```
### `GET /v1/tools/list`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back**
- Handler : `_list_tools`
- Source : `brainiak/core/api/app.py:264`
- Paramètres : `role: str`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/v1/tools/list?role=..."
```
### `POST /v1/vision/frame`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `vision_frame`
- Source : `brainiak/core/api/sensory_routes.py:214`
- Paramètres : `source: str, client_ts: float | None`
- Body / Form : `multipart/form-data ; fichiers: image: UploadFile`
- Response model : `—`
- Note handler : Upload image frame → VisionEngine.
```bash
curl -X POST "$BASE/v1/vision/frame?source=...&client_ts=..." -F 'image=@/path/file' -F 'source=...' -F 'client_ts=...'
```
### `GET /v1/voice/last.wav`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `voice_last_wav`
- Source : `brainiak/core/api/sensory_routes.py:156`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Download last generated WAV (for debug/replay).
```bash
curl -X GET "$BASE/v1/voice/last.wav"
```
### `POST /v1/voice/speak`
- Statut : **ACTIF_CORE**
- Type : **Front↔Back**
- Handler : `voice_speak`
- Source : `brainiak/core/api/sensory_routes.py:98`
- Paramètres : `—`
- Body / Form : `SpeakRequest`
- Response model : `—`
- Note handler : Speak text: emotion → prosody → TTS → WAV.
```bash
curl -X POST "$BASE/v1/voice/speak" -H 'Content-Type: application/json' -d '{"text": "string", "emotion_override": 1.0, "play_local": true, "client_ts": 1.0}'
```
Modèle `SpeakRequest` :
```json
{
  "text": "string",
  "emotion_override": 1.0,
  "play_local": true,
  "client_ts": 1.0
}
```
### `POST /v1/weights/save`
- Statut : **ACTIF_CORE**
- Type : **Back↔Back probable**
- Handler : `save_weights`
- Source : `brainiak/core/api/v1_routes.py:1012`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Persist LearningWeights + spider memory.
```bash
curl -X POST "$BASE/v1/weights/save"
```

## Appels détaillés — services autonomes
### `GET /`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `ui`
- Source : `apps/copilot/app.py:357`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/"
```
### `GET /`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `ui`
- Source : `apps/copilot/server.py:460`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/"
```
### `POST /analyze`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `analyze`
- Source : `apps/copilot/app.py:313`
- Paramètres : `—`
- Body / Form : `FolderRequest`
- Response model : `—`
```bash
curl -X POST "$BASE/analyze" -H 'Content-Type: application/json' -d '{"path": "string", "cluster": true}'
```
Modèle `FolderRequest` :
```json
{
  "path": "string",
  "cluster": true
}
```
### `POST /chat`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `chat`
- Source : `apps/copilot/server.py:403`
- Paramètres : `—`
- Body / Form : `ChatReq`
- Response model : `—`
```bash
curl -X POST "$BASE/chat" -H 'Content-Type: application/json' -d '{"message": "string", "history": [], "mode": "string"}'
```
Modèle `ChatReq` :
```json
{
  "message": "string",
  "history": [],
  "mode": "string"
}
```
### `POST /cluster`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `cluster_docs`
- Source : `apps/copilot/server.py:344`
- Paramètres : `—`
- Body / Form : `dict`
- Response model : `—`
```bash
curl -X POST "$BASE/cluster" -H 'Content-Type: application/json' -d '{"...": "dict"}'
```
### `POST /draft`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `draft`
- Source : `apps/copilot/app.py:290`
- Paramètres : `—`
- Body / Form : `DraftRequest`
- Response model : `—`
- Note handler : Rédiger une réponse à un mail via LLM.
```bash
curl -X POST "$BASE/draft" -H 'Content-Type: application/json' -d '{"doc": {}, "instruction": "string"}'
```
Modèle `DraftRequest` :
```json
{
  "doc": {},
  "instruction": "string"
}
```
### `POST /draft`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `draft`
- Source : `apps/copilot/server.py:389`
- Paramètres : `—`
- Body / Form : `DraftReq`
- Response model : `—`
```bash
curl -X POST "$BASE/draft" -H 'Content-Type: application/json' -d '{"doc": {}, "instruction": "string"}'
```
Modèle `DraftReq` :
```json
{
  "doc": {},
  "instruction": "string"
}
```
### `GET /health`
- Statut : **SERVICE_AUTONOME_DUPLIQUE_CORE**
- Type : **Back↔Back / supervision**
- Handler : `health`
- Source : `brainiak/tool_hub/main.py:146`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Health check.
```bash
curl -X GET "$BASE/health"
```
### `GET /health`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back / supervision**
- Handler : `health`
- Source : `deploy/vllm/mock_server.py:41`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/health"
```
### `POST /query`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `query`
- Source : `apps/copilot/app.py:341`
- Paramètres : `—`
- Body / Form : `QueryRequest`
- Response model : `—`
- Note handler : Trouver les documents les plus similaires à une requête.
```bash
curl -X POST "$BASE/query" -H 'Content-Type: application/json' -d '{"docs": [], "query": "string"}'
```
Modèle `QueryRequest` :
```json
{
  "docs": [],
  "query": "string"
}
```
### `POST /query`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `query`
- Source : `apps/copilot/server.py:363`
- Paramètres : `—`
- Body / Form : `QueryReq`
- Response model : `—`
```bash
curl -X POST "$BASE/query" -H 'Content-Type: application/json' -d '{"docs": [], "query": "string"}'
```
Modèle `QueryReq` :
```json
{
  "docs": [],
  "query": "string"
}
```
### `GET /status`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back / supervision**
- Handler : `status`
- Source : `apps/copilot/app.py:251`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/status"
```
### `GET /status`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back / supervision**
- Handler : `status`
- Source : `apps/copilot/server.py:322`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/status"
```
### `POST /summarize`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `summarize`
- Source : `apps/copilot/app.py:269`
- Paramètres : `—`
- Body / Form : `SummarizeRequest`
- Response model : `—`
- Note handler : Résumer un cluster de documents en prose via LLM.
```bash
curl -X POST "$BASE/summarize" -H 'Content-Type: application/json' -d '{"docs": [], "cluster_keywords": "string", "cluster_size": 1}'
```
Modèle `SummarizeRequest` :
```json
{
  "docs": [],
  "cluster_keywords": "string",
  "cluster_size": 1
}
```
### `POST /summarize`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `summarize`
- Source : `apps/copilot/server.py:375`
- Paramètres : `—`
- Body / Form : `SumReq`
- Response model : `—`
```bash
curl -X POST "$BASE/summarize" -H 'Content-Type: application/json' -d '{"docs": [], "keywords": "string", "size": 1}'
```
Modèle `SumReq` :
```json
{
  "docs": [],
  "keywords": "string",
  "size": 1
}
```
### `GET /tasks`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `list_tasks`
- Source : `apps/copilot/server.py:414`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/tasks"
```
### `POST /tasks`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `create_task`
- Source : `apps/copilot/server.py:418`
- Paramètres : `—`
- Body / Form : `AutoTask`
- Response model : `—`
```bash
curl -X POST "$BASE/tasks" -H 'Content-Type: application/json' -d '{"id": "string", "name": "string", "nodes": [], "schedule": "string", "enabled": true, "last_run": "string", "last_status": "string", "last_output": "string"}'
```
Modèle `AutoTask` :
```json
{
  "id": "string",
  "name": "string",
  "nodes": [],
  "schedule": "string",
  "enabled": true,
  "last_run": "string",
  "last_status": "string",
  "last_output": "string"
}
```
### `DELETE /tasks/{task_id}`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `delete_task`
- Source : `apps/copilot/server.py:435`
- Paramètres : `task_id: str`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X DELETE "$BASE/tasks/EXAMPLE_task_id"
```
### `PUT /tasks/{task_id}`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `update_task`
- Source : `apps/copilot/server.py:426`
- Paramètres : `task_id: str`
- Body / Form : `AutoTask`
- Response model : `—`
```bash
curl -X PUT "$BASE/tasks/EXAMPLE_task_id" -H 'Content-Type: application/json' -d '{"id": "string", "name": "string", "nodes": [], "schedule": "string", "enabled": true, "last_run": "string", "last_status": "string", "last_output": "string"}'
```
Modèle `AutoTask` :
```json
{
  "id": "string",
  "name": "string",
  "nodes": [],
  "schedule": "string",
  "enabled": true,
  "last_run": "string",
  "last_status": "string",
  "last_output": "string"
}
```
### `POST /tasks/{task_id}/run`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `run_task_now`
- Source : `apps/copilot/server.py:443`
- Paramètres : `task_id: str`
- Body / Form : `query/form params`
- Response model : `—`
```bash
curl -X POST "$BASE/tasks/EXAMPLE_task_id/run"
```
### `POST /tts/batch`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `batch_clone`
- Source : `deploy/tts/tts_service.py:332`
- Paramètres : `texts: str, voice: str, language: str, emotion: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Batch synthesis — multiple texts, same voice/emotion. Returns JSON with base64 audio.
```bash
curl -X POST "$BASE/tts/batch?texts=...&voice=...&language=...&emotion=..."
```
### `POST /tts/clone`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `clone_speech`
- Source : `deploy/tts/tts_service.py:246`
- Paramètres : `text: str, voice: str, language: str, emotion: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Synthesize text with a cloned voice.
```bash
curl -X POST "$BASE/tts/clone?text=...&voice=...&language=...&emotion=..."
```
### `GET /tts/health`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back / supervision**
- Handler : `health`
- Source : `deploy/tts/tts_service.py:190`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/tts/health"
```
### `GET /tts/profiles`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `list_profiles`
- Source : `deploy/tts/tts_service.py:200`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/tts/profiles"
```
### `POST /tts/register`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `register_voice`
- Source : `deploy/tts/tts_service.py:205`
- Paramètres : `name: str, ref_text: str`
- Body / Form : `multipart/form-data ; fichiers: audio: UploadFile`
- Response model : `—`
- Note handler : Register a voice from reference audio (WAV/MP3, 3-30s).
```bash
curl -X POST "$BASE/tts/register?name=...&ref_text=..." -F 'name=...' -F 'ref_text=...' -F 'audio=@/path/file'
```
### `POST /upload`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Front↔Back**
- Handler : `upload`
- Source : `apps/copilot/server.py:328`
- Paramètres : `—`
- Body / Form : `multipart/form-data ; fichiers: files: list[UploadFile]`
- Response model : `—`
```bash
curl -X POST "$BASE/upload" -F 'files=@/path/file'
```
### `POST /v1/chat/completions`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `chat_completions`
- Source : `deploy/vllm/mock_server.py:59`
- Paramètres : `—`
- Body / Form : `ChatRequest`
- Response model : `—`
```bash
curl -X POST "$BASE/v1/chat/completions" -H 'Content-Type: application/json' -d '{"model": "string", "messages": [], "max_tokens": 1, "temperature": 1.0, "stream": true}'
```
Modèle `ChatRequest` :
```json
{
  "model": "string",
  "messages": [],
  "max_tokens": 1,
  "temperature": 1.0,
  "stream": true
}
```
### `GET /v1/models`
- Statut : **SERVICE_AUTONOME_OPTIONNEL**
- Type : **Back↔Back**
- Handler : `list_models`
- Source : `deploy/vllm/mock_server.py:46`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/v1/models"
```
### `POST /v1/tools/call`
- Statut : **SERVICE_AUTONOME_DUPLIQUE_CORE**
- Type : **Back↔Back**
- Handler : `call_tool`
- Source : `brainiak/tool_hub/main.py:103`
- Paramètres : `—`
- Body / Form : `ToolCallRequest`
- Response model : `ToolCallResponse`
- Note handler : Execute a tool. Routes locally or forwards to peer node.
```bash
curl -X POST "$BASE/v1/tools/call" -H 'Content-Type: application/json' -d '{"tool": "string", "arguments": {}, "role": "string", "forwarded": true}'
```
Modèle `ToolCallRequest` :
```json
{
  "tool": "string",
  "arguments": {},
  "role": "string",
  "forwarded": true
}
```
### `GET /v1/tools/list`
- Statut : **SERVICE_AUTONOME_DUPLIQUE_CORE**
- Type : **Back↔Back**
- Handler : `list_tools`
- Source : `brainiak/tool_hub/main.py:92`
- Paramètres : `role: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Return OpenAI function-calling schemas for tools accessible to this role.
```bash
curl -X GET "$BASE/v1/tools/list?role=..."
```

## Appels détaillés — legacy / non montées
### `GET /health`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `health`
- Source : `brainiak.old/core/api/routes.py:188`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `HealthResponse`
- Note handler : Healthcheck endpoint.
```bash
curl -X GET "$BASE/health"
```
### `GET /health`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `health`
- Source : `brainiak.old/tool_hub/main.py:146`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Health check.
```bash
curl -X GET "$BASE/health"
```
### `GET /teaching`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_dashboard`
- Source : `brainiak.old/core/api/teaching_routes.py:1318`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve the Teaching Dashboard SPA.
```bash
curl -X GET "$BASE/teaching"
```
### `GET /teaching/audio/{word}`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_audio`
- Source : `brainiak.old/core/api/teaching_routes.py:344`
- Paramètres : `word: str, voice: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Generate or serve cached TTS audio for a word with selected voice.
```bash
curl -X GET "$BASE/teaching/audio/EXAMPLE_word?voice=..."
```
### `POST /teaching/crystallize`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_crystallize_endpoint`
- Source : `brainiak.old/core/api/teaching_routes.py:1180`
- Paramètres : `target: str, reward: float`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Crystallize a T^n concept independently. No reinforcement.
```bash
curl -X POST "$BASE/teaching/crystallize?target=...&reward=..."
```
### `POST /teaching/crystallize_primitive`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_crystallize_primitive`
- Source : `brainiak.old/core/api/teaching_routes.py:1203`
- Paramètres : `—`
- Body / Form : `PrimitiveCrystallizeRequest`
- Response model : `—`
- Note handler : Crystallize a grammatical primitive (NEGATOR, POS_CATEGORY, ...).
```bash
curl -X POST "$BASE/teaching/crystallize_primitive" -H 'Content-Type: application/json' -d '{"target": "string", "primitive_type": "string", "grammar_slots": {}, "reward": 1.0}'
```
Modèle `PrimitiveCrystallizeRequest` :
```json
{
  "target": "string",
  "primitive_type": "string",
  "grammar_slots": {},
  "reward": 1.0
}
```
### `POST /teaching/edit-def`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `edit_definition`
- Source : `brainiak.old/core/api/teaching_routes.py:464`
- Paramètres : `—`
- Body / Form : `EditDefRequest`
- Response model : `—`
- Note handler : Override a word definition for teaching.
```bash
curl -X POST "$BASE/teaching/edit-def" -H 'Content-Type: application/json' -d '{"word": "string", "definition": "string"}'
```
Modèle `EditDefRequest` :
```json
{
  "word": "string",
  "definition": "string"
}
```
### `POST /teaching/encode`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_encode`
- Source : `brainiak.old/core/api/teaching_routes.py:1138`
- Paramètres : `target: str, show_image: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Encode a word/phrase → T^n + R^14 + optional R^6_vis/R^6_aud.
```bash
curl -X POST "$BASE/teaching/encode?target=...&show_image=..."
```
### `GET /teaching/events`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_events`
- Source : `brainiak.old/core/api/teaching_routes.py:181`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : SSE stream of teaching events.
```bash
curl -X GET "$BASE/teaching/events"
```
### `GET /teaching/exercise`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_exercise`
- Source : `brainiak.old/core/api/teaching_routes.py:431`
- Paramètres : `word: str | None`
- Body / Form : `—`
- Response model : `—`
- Note handler : Get current exercise, or a specific word's exercise.
```bash
curl -X GET "$BASE/teaching/exercise?word=..."
```
### `POST /teaching/flush`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_flush`
- Source : `brainiak.old/core/api/teaching_routes.py:1295`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force-save crystallized T^n and learning weights to disk.
```bash
curl -X POST "$BASE/teaching/flush"
```
### `GET /teaching/image/{word}`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_image`
- Source : `brainiak.old/core/api/teaching_routes.py:332`
- Paramètres : `word: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve imagier image for a word (ARASAAC pictograms = PNG).
```bash
curl -X GET "$BASE/teaching/image/EXAMPLE_word"
```
### `POST /teaching/mode`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `set_mode`
- Source : `brainiak.old/core/api/teaching_routes.py:383`
- Paramètres : `—`
- Body / Form : `ModeRequest`
- Response model : `—`
- Note handler : Switch teaching mode.
```bash
curl -X POST "$BASE/teaching/mode" -H 'Content-Type: application/json' -d '{"mode": "string"}'
```
Modèle `ModeRequest` :
```json
{
  "mode": "string"
}
```
### `POST /teaching/navigate`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `navigate`
- Source : `brainiak.old/core/api/teaching_routes.py:395`
- Paramètres : `action: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Navigate exercises in teacher mode. action: next|prev|skip|repeat
```bash
curl -X POST "$BASE/teaching/navigate?action=..."
```
### `POST /teaching/phase`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `switch_phase`
- Source : `brainiak.old/core/api/teaching_routes.py:419`
- Paramètres : `phase: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Switch lexicon phase: phase2 (single words) or phase3 (compositions).
```bash
curl -X POST "$BASE/teaching/phase?phase=..."
```
### `POST /teaching/reinforce`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `manual_reinforce`
- Source : `brainiak.old/core/api/teaching_routes.py:477`
- Paramètres : `—`
- Body / Form : `ReinforceRequest`
- Response model : `—`
- Note handler : Manual reinforcement — wraps /v1/reinforce + publishes SSE event.
```bash
curl -X POST "$BASE/teaching/reinforce" -H 'Content-Type: application/json' -d '{"type": "string", "intensity": 1.0, "target": "string", "correction_text": "string", "emotion_context": "string"}'
```
Modèle `ReinforceRequest` :
```json
{
  "type": "string",
  "intensity": 1.0,
  "target": "string",
  "correction_text": "string",
  "emotion_context": "string"
}
```
### `POST /teaching/teach`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_trial`
- Source : `brainiak.old/core/api/teaching_routes.py:1247`
- Paramètres : `stimulus: str, target: str, show_image: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Run a single DTT trial — orchestrator calling sub-functions.
```bash
curl -X POST "$BASE/teaching/teach?stimulus=...&target=...&show_image=..."
```
### `POST /teaching/upload`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `upload_teaching_file`
- Source : `brainiak.old/core/api/teaching_routes.py:498`
- Paramètres : `source: str`
- Body / Form : `multipart/form-data ; fichiers: file: UploadFile`
- Response model : `—`
- Note handler : Upload an image/audio/video file for free-mode teaching.
```bash
curl -X POST "$BASE/teaching/upload?source=..." -F 'file=@/path/file' -F 'source=...'
```
### `POST /teaching/verify`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_verify`
- Source : `brainiak.old/core/api/teaching_routes.py:1163`
- Paramètres : `target: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Verify composition + roles for a phrase. No reinforcement.
```bash
curl -X POST "$BASE/teaching/verify?target=..."
```
### `GET /teaching/weights`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_weights`
- Source : `brainiak.old/core/api/teaching_routes.py:235`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Snapshot of all 12 learnable matrices — for 3D surface visualization.
```bash
curl -X GET "$BASE/teaching/weights"
```
### `GET /teaching/weights/detail`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_weights_detail`
- Source : `brainiak.old/core/api/teaching_routes.py:301`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Detailed weight matrices — per-row/col norms for heterogeneity check.
```bash
curl -X GET "$BASE/teaching/weights/detail"
```
### `GET /toolhub/health`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `_toolhub_health`
- Source : `brainiak.old/core/api/app.py:310`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/toolhub/health"
```
### `GET /ui`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `serve_ui`
- Source : `brainiak.old/core/api/ui_routes.py:1963`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Serve the BrainiaK Think single-page application.
```bash
curl -X GET "$BASE/ui"
```
### `GET /ui/files`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `list_files`
- Source : `brainiak.old/core/api/ui_routes.py:44`
- Paramètres : `path: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : List files and directories in the given path.
```bash
curl -X GET "$BASE/ui/files?path=..."
```
### `POST /v0/admin/aggregate/daily`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `trigger_daily_aggregate`
- Source : `brainiak.old/core/api/admin_routes.py:89`
- Paramètres : `—`
- Body / Form : `DailyAggregateRequest`
- Response model : `—`
- Note handler : Trigger DailyAggregator for the given date.
```bash
curl -X POST "$BASE/v0/admin/aggregate/daily" -H 'Content-Type: application/json' -d '{"date": "string"}'
```
Modèle `DailyAggregateRequest` :
```json
{
  "date": "string"
}
```
### `POST /v0/admin/aggregate/weekly`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `trigger_weekly_aggregate`
- Source : `brainiak.old/core/api/admin_routes.py:115`
- Paramètres : `—`
- Body / Form : `WeeklyAggregateRequest`
- Response model : `—`
- Note handler : Trigger WeeklyAggregator for the week starting on week_start.
```bash
curl -X POST "$BASE/v0/admin/aggregate/weekly" -H 'Content-Type: application/json' -d '{"week_start": "string"}'
```
Modèle `WeeklyAggregateRequest` :
```json
{
  "week_start": "string"
}
```
### `POST /v0/admin/batch/nightly`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `trigger_nightly_batch`
- Source : `brainiak.old/core/api/admin_routes.py:176`
- Paramètres : `—`
- Body / Form : `NightlyBatchRequest`
- Response model : `—`
- Note handler : Trigger the full nightly batch: daily → weekly → MathCore pipeline → warmup.
```bash
curl -X POST "$BASE/v0/admin/batch/nightly" -H 'Content-Type: application/json' -d '{"date": "string"}'
```
Modèle `NightlyBatchRequest` :
```json
{
  "date": "string"
}
```
### `POST /v0/admin/bootstrap/calibrate`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `bootstrap_calibrate`
- Source : `brainiak.old/core/api/admin_routes.py:345`
- Paramètres : `—`
- Body / Form : `BootstrapRunRequest`
- Response model : `—`
- Note handler : Run one calibration step for a tenant (manual trigger).
```bash
curl -X POST "$BASE/v0/admin/bootstrap/calibrate" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "n_runs": 1}'
```
Modèle `BootstrapRunRequest` :
```json
{
  "tenant_id": "string",
  "n_runs": 1
}
```
### `POST /v0/admin/bootstrap/run`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `bootstrap_run`
- Source : `brainiak.old/core/api/admin_routes.py:323`
- Paramètres : `—`
- Body / Form : `BootstrapRunRequest`
- Response model : `—`
- Note handler : Run the bootstrap pipeline for a tenant.
```bash
curl -X POST "$BASE/v0/admin/bootstrap/run" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "n_runs": 1}'
```
Modèle `BootstrapRunRequest` :
```json
{
  "tenant_id": "string",
  "n_runs": 1
}
```
### `GET /v0/admin/bootstrap/status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `bootstrap_status`
- Source : `brainiak.old/core/api/admin_routes.py:311`
- Paramètres : `tenant_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Check initial conditions (CI gate) for a tenant.
```bash
curl -X GET "$BASE/v0/admin/bootstrap/status?tenant_id=..."
```
### `POST /v0/admin/mathcore/pipeline`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `trigger_mathcore_pipeline`
- Source : `brainiak.old/core/api/admin_routes.py:141`
- Paramètres : `—`
- Body / Form : `MathCorePipelineRequest`
- Response model : `—`
- Note handler : Trigger full MathCore pipeline: FFS → MixMod → Drift Detection.
```bash
curl -X POST "$BASE/v0/admin/mathcore/pipeline" -H 'Content-Type: application/json' -d '{"tenant_id": "string", "date": "string"}'
```
Modèle `MathCorePipelineRequest` :
```json
{
  "tenant_id": "string",
  "date": "string"
}
```
### `GET /v0/admin/recommendation/active`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_active_recommendation`
- Source : `brainiak.old/core/api/admin_routes.py:285`
- Paramètres : `tenant_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Get current MathCore recommendations for a tenant.
```bash
curl -X GET "$BASE/v0/admin/recommendation/active?tenant_id=..."
```
### `GET /v0/admin/registry/nodes`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `list_registry_nodes`
- Source : `brainiak.old/core/api/admin_routes.py:364`
- Paramètres : `reload: bool`
- Body / Form : `—`
- Response model : `—`
- Note handler : List all entries in node_registry.
```bash
curl -X GET "$BASE/v0/admin/registry/nodes?reload=..."
```
### `POST /v0/admin/telemetry/ingest`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `ingest_telemetry`
- Source : `brainiak.old/core/api/admin_routes.py:234`
- Paramètres : `—`
- Body / Form : `TelemetryIngestRequest`
- Response model : `—`
- Note handler : Ingest telemetry events from external sources (scripts, edge tools).
```bash
curl -X POST "$BASE/v0/admin/telemetry/ingest" -H 'Content-Type: application/json' -d '{"events": [], "tenant_id": "string"}'
```
Modèle `TelemetryIngestRequest` :
```json
{
  "events": [],
  "tenant_id": "string"
}
```
### `POST /v0/dev/chat`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `dev_chat`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:818`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `DevChatResponse`
- Note handler : Dev agent chat endpoint — synchronous tool-calling loop.
```bash
curl -X POST "$BASE/v0/dev/chat" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `POST /v0/dev/chat/async`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `dev_chat_async_submit`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:839`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `—`
- Note handler : Async dev agent — submit job, return job_id immediately.
```bash
curl -X POST "$BASE/v0/dev/chat/async" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `POST /v0/dev/chat/stream`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `dev_chat_stream`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:855`
- Paramètres : `—`
- Body / Form : `DevChatRequest`
- Response model : `—`
- Note handler : SSE streaming dev agent — single HTTP connection, real-time events.
```bash
curl -X POST "$BASE/v0/dev/chat/stream" -H 'Content-Type: application/json' -d '{"messages": [], "max_tokens": 1, "max_turns": 1, "working_directory": "string", "enable_thinking": true, "session_id": "string"}'
```
Modèle `DevChatRequest` :
```json
{
  "messages": [],
  "max_tokens": 1,
  "max_turns": 1,
  "working_directory": "string",
  "enable_thinking": true,
  "session_id": "string"
}
```
### `GET /v0/dev/chat/{job_id}/result`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `dev_chat_job_result`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:1110`
- Paramètres : `job_id: str`
- Body / Form : `—`
- Response model : `DevChatResponse`
- Note handler : Fetch completed async job result.
```bash
curl -X GET "$BASE/v0/dev/chat/EXAMPLE_job_id/result"
```
### `GET /v0/dev/chat/{job_id}/status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `dev_chat_job_status`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:1095`
- Paramètres : `job_id: str`
- Body / Form : `—`
- Response model : `DevJobStatus`
- Note handler : Poll async job status (Postgres-backed, survives reload).
```bash
curl -X GET "$BASE/v0/dev/chat/EXAMPLE_job_id/status"
```
### `GET /v0/dev/mathcore/gamma`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `mathcore_gamma`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:1124`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Expose the Gamma externality matrix — BrainiaK's inter-node correlation structure.
```bash
curl -X GET "$BASE/v0/dev/mathcore/gamma"
```
### `DELETE /v0/dev/session`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `clear_session`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:444`
- Paramètres : `session_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Clear session history.
```bash
curl -X DELETE "$BASE/v0/dev/session?session_id=..."
```
### `GET /v0/dev/session`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_session`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:424`
- Paramètres : `session_id: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Return stored message history for a session (UI restore on page load).
```bash
curl -X GET "$BASE/v0/dev/session?session_id=..."
```
### `POST /v0/dev/session/messages`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `append_session_messages`
- Source : `brainiak/core/api/dev_routes_legacy_v4.py:430`
- Paramètres : `session_id: str`
- Body / Form : `_AppendSessionBody`
- Response model : `—`
- Note handler : Append messages to session history (called after each exchange).
```bash
curl -X POST "$BASE/v0/dev/session/messages?session_id=..." -H 'Content-Type: application/json' -d '{"messages": []}'
```
Modèle `_AppendSessionBody` :
```json
{
  "messages": []
}
```
### `POST /v0/request`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `submit_request`
- Source : `brainiak.old/core/api/routes.py:66`
- Paramètres : `—`
- Body / Form : `RequestInput`
- Response model : `RequestAccepted`
- Note handler : Submit a new request to the BrainiaK pipeline.
```bash
curl -X POST "$BASE/v0/request" -H 'Content-Type: application/json' -d '{"...": "RequestInput"}'
```
### `GET /v0/request/{request_id}/response`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_request_response`
- Source : `brainiak.old/core/api/routes.py:159`
- Paramètres : `request_id: UUID`
- Body / Form : `—`
- Response model : `ResponseOutput`
- Note handler : Retrieve the completed ResponseOutput for a request.
```bash
curl -X GET "$BASE/v0/request/EXAMPLE_request_id/response"
```
### `GET /v0/request/{request_id}/status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_request_status`
- Source : `brainiak.old/core/api/routes.py:135`
- Paramètres : `request_id: UUID`
- Body / Form : `—`
- Response model : `RequestStatusResponse`
- Note handler : Get the current status of a request.
```bash
curl -X GET "$BASE/v0/request/EXAMPLE_request_id/status"
```
### `POST /v1/audio/inject`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `audio_inject`
- Source : `brainiak.old/core/api/sensory_routes.py:166`
- Paramètres : `—`
- Body / Form : `InjectRequest`
- Response model : `—`
- Note handler : Inject R^6_aud vector directly into AuditoryEngine.
```bash
curl -X POST "$BASE/v1/audio/inject" -H 'Content-Type: application/json' -d '{"vector": 1.0, "source_tag": "string", "client_ts": 1.0}'
```
Modèle `InjectRequest` :
```json
{
  "vector": 1.0,
  "source_tag": "string",
  "client_ts": 1.0
}
```
### `POST /v1/audio/upload`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `audio_upload`
- Source : `brainiak.old/core/api/sensory_routes.py:177`
- Paramètres : `source: str, client_ts: float | None`
- Body / Form : `multipart/form-data ; fichiers: audio: UploadFile`
- Response model : `—`
- Note handler : Upload audio chunk (WAV/PCM) → AuditoryEngine.
```bash
curl -X POST "$BASE/v1/audio/upload?source=...&client_ts=..." -F 'audio=@/path/file' -F 'source=...' -F 'client_ts=...'
```
### `POST /v1/bootstrap`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `bootstrap_nelson`
- Source : `brainiak.old/core/api/v1_routes.py:923`
- Paramètres : `level: int`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Seed reinforcement valence with Nelson vocabulary tiers.
```bash
curl -X POST "$BASE/v1/bootstrap?level=..."
```
### `GET /v1/crystals/encode`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `crystals_encode`
- Source : `brainiak.old/core/api/crystal_routes.py:265`
- Paramètres : `text: str, include_s5: bool`
- Body / Form : `—`
- Response model : `—`
- Note handler : Encode un texte → résumé T^n : R^14 moyen + S^5 des mots cristallisés.
```bash
curl -X GET "$BASE/v1/crystals/encode?text=...&include_s5=..."
```
### `GET /v1/crystals/info`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `crystals_info`
- Source : `brainiak.old/core/api/crystal_routes.py:114`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `CrystalInfo`
- Note handler : Stats du store : nombre de cristaux, chemin, timestamp de chargement.
```bash
curl -X GET "$BASE/v1/crystals/info"
```
### `GET /v1/crystals/lookup`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `crystals_lookup`
- Source : `brainiak.old/core/api/crystal_routes.py:121`
- Paramètres : `word: str, include_s5: bool`
- Body / Form : `—`
- Response model : `CrystalResult`
- Note handler : Retourne le cristal T^n complet pour un mot donné.
```bash
curl -X GET "$BASE/v1/crystals/lookup?word=...&include_s5=..."
```
### `POST /v1/crystals/lookup_batch`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `crystals_lookup_batch`
- Source : `brainiak.old/core/api/crystal_routes.py:164`
- Paramètres : `—`
- Body / Form : `BatchLookupRequest`
- Response model : `—`
- Note handler : Lookup de plusieurs mots en une requête.
```bash
curl -X POST "$BASE/v1/crystals/lookup_batch" -H 'Content-Type: application/json' -d '{"words": "string", "include_s5": true}'
```
Modèle `BatchLookupRequest` :
```json
{
  "words": "string",
  "include_s5": true
}
```
### `POST /v1/crystals/nearest`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `crystals_nearest`
- Source : `brainiak.old/core/api/crystal_routes.py:208`
- Paramètres : `—`
- Body / Form : `NearestRequest`
- Response model : `—`
- Note handler : K plus proches voisins d'un vecteur R^14 dans le store.
```bash
curl -X POST "$BASE/v1/crystals/nearest" -H 'Content-Type: application/json' -d '{"r14": 1.0, "k": 1, "socle": "string"}'
```
Modèle `NearestRequest` :
```json
{
  "r14": 1.0,
  "k": 1,
  "socle": "string"
}
```
### `GET /v1/diagnose`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `diagnose_text`
- Source : `brainiak.old/core/api/v1_routes.py:661`
- Paramètres : `text: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Diagnose how BrainiaK reads a text.
```bash
curl -X GET "$BASE/v1/diagnose?text=..."
```
### `GET /v1/events`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `proactive_events`
- Source : `brainiak.old/core/api/sensory_routes.py:1568`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : SSE stream for proactive messages from BrainiaK.
```bash
curl -X GET "$BASE/v1/events"
```
### `POST /v1/feedback`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `self_learning_feedback`
- Source : `brainiak.old/core/api/v1_routes.py:546`
- Paramètres : `—`
- Body / Form : `FeedbackRequest`
- Response model : `—`
- Note handler : Human feedback for self-learning.
```bash
curl -X POST "$BASE/v1/feedback" -H 'Content-Type: application/json' -d '{"verdict": "string", "word": "string", "text": "string", "session_id": "string"}'
```
Modèle `FeedbackRequest` :
```json
{
  "verdict": "string",
  "word": "string",
  "text": "string",
  "session_id": "string"
}
```
### `POST /v1/feedback-sense`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `feedback_sense`
- Source : `brainiak.old/core/api/v1_routes.py:634`
- Paramètres : `—`
- Body / Form : `FeedbackSenseRequest`
- Response model : `—`
- Note handler : Feedback on a specific sense of a polysemous word.
```bash
curl -X POST "$BASE/v1/feedback-sense" -H 'Content-Type: application/json' -d '{"word": "string", "sense_label": "string", "verdict": "string", "context_sentence": "string", "session_id": "string"}'
```
Modèle `FeedbackSenseRequest` :
```json
{
  "word": "string",
  "sense_label": "string",
  "verdict": "string",
  "context_sentence": "string",
  "session_id": "string"
}
```
### `POST /v1/heartbeat/interval`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_set_interval`
- Source : `brainiak.old/core/api/sensory_routes.py:1663`
- Paramètres : `—`
- Body / Form : `_HeartbeatIntervalRequest`
- Response model : `—`
- Note handler : Set heartbeat interval manually. 0 = auto (CES regime).
```bash
curl -X POST "$BASE/v1/heartbeat/interval" -H 'Content-Type: application/json' -d '{"interval": 1.0}'
```
Modèle `_HeartbeatIntervalRequest` :
```json
{
  "interval": 1.0
}
```
### `POST /v1/heartbeat/ping`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_ping`
- Source : `brainiak.old/core/api/sensory_routes.py:1625`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Mark that someone is interacting with BrainiaK.
```bash
curl -X POST "$BASE/v1/heartbeat/ping"
```
### `POST /v1/heartbeat/sleep`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_force_sleep`
- Source : `brainiak.old/core/api/sensory_routes.py:1674`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force enter sleep mode (for testing / manual consolidation).
```bash
curl -X POST "$BASE/v1/heartbeat/sleep"
```
### `POST /v1/heartbeat/start`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_start`
- Source : `brainiak.old/core/api/sensory_routes.py:1602`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Start BrainiaK's autonomous heartbeat.
```bash
curl -X POST "$BASE/v1/heartbeat/start"
```
### `GET /v1/heartbeat/status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_status`
- Source : `brainiak.old/core/api/sensory_routes.py:1632`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current heartbeat state + recent activity log.
```bash
curl -X GET "$BASE/v1/heartbeat/status"
```
### `POST /v1/heartbeat/stop`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_stop`
- Source : `brainiak.old/core/api/sensory_routes.py:1614`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Stop BrainiaK's heartbeat.
```bash
curl -X POST "$BASE/v1/heartbeat/stop"
```
### `GET /v1/heartbeat/tensions`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_tensions`
- Source : `brainiak.old/core/api/sensory_routes.py:1694`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Inspect the tension queue.
```bash
curl -X GET "$BASE/v1/heartbeat/tensions"
```
### `POST /v1/heartbeat/wake`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `heartbeat_force_wake`
- Source : `brainiak.old/core/api/sensory_routes.py:1685`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Force wake up from sleep mode.
```bash
curl -X POST "$BASE/v1/heartbeat/wake"
```
### `GET /v1/learning-status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `learning_status`
- Source : `brainiak.old/core/api/v1_routes.py:675`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current learning status: LearningWeights + SSTD scorer stats.
```bash
curl -X GET "$BASE/v1/learning-status"
```
### `DELETE /v1/modes`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `reset_modes`
- Source : `brainiak.old/core/api/v1_routes.py:1119`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : DELETE /v1/modes — Reset aux modes par défaut (symbiose_jp uniquement).
```bash
curl -X DELETE "$BASE/v1/modes"
```
### `GET /v1/modes`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_modes`
- Source : `brainiak.old/core/api/v1_routes.py:1064`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : GET /v1/modes — Status des modes actifs + liste disponible.
```bash
curl -X GET "$BASE/v1/modes"
```
### `POST /v1/modes`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `set_modes`
- Source : `brainiak.old/core/api/v1_routes.py:1103`
- Paramètres : `—`
- Body / Form : `dict`
- Response model : `—`
- Note handler : POST /v1/modes — Set les modes actifs (remplace l'état courant).
```bash
curl -X POST "$BASE/v1/modes" -H 'Content-Type: application/json' -d '{"...": "dict"}'
```
### `DELETE /v1/modes/{mode_name}`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `deactivate_mode`
- Source : `brainiak.old/core/api/v1_routes.py:1094`
- Paramètres : `mode_name: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : DELETE /v1/modes/{mode} — Désactive un mode.
```bash
curl -X DELETE "$BASE/v1/modes/EXAMPLE_mode_name"
```
### `POST /v1/modes/{mode_name}`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `activate_mode`
- Source : `brainiak.old/core/api/v1_routes.py:1082`
- Paramètres : `mode_name: str`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : POST /v1/modes/{mode} — Active un mode (ex: POST /v1/modes/expert_math).
```bash
curl -X POST "$BASE/v1/modes/EXAMPLE_mode_name"
```
### `POST /v1/production/save`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `save_production`
- Source : `brainiak.old/core/api/v1_routes.py:968`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Save ProductionMemory + LearningWeights + acquired valence.
```bash
curl -X POST "$BASE/v1/production/save"
```
### `POST /v1/prompt`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `unified_prompt`
- Source : `brainiak.old/core/api/v1_routes.py:464`
- Paramètres : `—`
- Body / Form : `PromptRequest`
- Response model : `—`
- Note handler : Unified BrainiaK v4 endpoint.
```bash
curl -X POST "$BASE/v1/prompt" -H 'Content-Type: application/json' -d '{"content": "string", "messages": [], "session_id": "string", "tenant_id": "string", "force_request": true, "enable_thinking": true, "stream": true, "mode": "string", "max_tokens": 1, "max_turns": 1}'
```
Modèle `PromptRequest` :
```json
{
  "content": "string",
  "messages": [],
  "session_id": "string",
  "tenant_id": "string",
  "force_request": true,
  "enable_thinking": true,
  "stream": true,
  "mode": "string",
  "max_tokens": 1,
  "max_turns": 1
}
```
### `POST /v1/prompt/control/{request_id}`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `pipeline_control`
- Source : `brainiak.old/core/api/v1_routes.py:1040`
- Paramètres : `request_id: str`
- Body / Form : `PipelineControlRequest`
- Response model : `—`
- Note handler : Signal de contrôle pour un pipeline en cours.
```bash
curl -X POST "$BASE/v1/prompt/control/EXAMPLE_request_id" -H 'Content-Type: application/json' -d '{"action": "string"}'
```
Modèle `PipelineControlRequest` :
```json
{
  "action": "string"
}
```
### `POST /v1/reinforce`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `reinforce`
- Source : `brainiak.old/core/api/v1_routes.py:752`
- Paramètres : `—`
- Body / Form : `ReinforceRequest`
- Response model : `—`
- Note handler : Apply explicit reinforcement to last tokenless attempt.
```bash
curl -X POST "$BASE/v1/reinforce" -H 'Content-Type: application/json' -d '{"type": "string", "intensity": 1.0, "target": "string", "correction_text": "string", "emotion_context": "string"}'
```
Modèle `ReinforceRequest` :
```json
{
  "type": "string",
  "intensity": 1.0,
  "target": "string",
  "correction_text": "string",
  "emotion_context": "string"
}
```
### `GET /v1/reinforcement-config`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_reinforcement_config`
- Source : `brainiak.old/core/api/v1_routes.py:847`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current behaviorist parameters + state.
```bash
curl -X GET "$BASE/v1/reinforcement-config"
```
### `POST /v1/reinforcement-config`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `set_reinforcement_config`
- Source : `brainiak.old/core/api/v1_routes.py:818`
- Paramètres : `—`
- Body / Form : `ReinforcementConfigRequest`
- Response model : `—`
- Note handler : Adjust behaviorist parameters in real-time.
```bash
curl -X POST "$BASE/v1/reinforcement-config" -H 'Content-Type: application/json' -d '{"extinction_k": 1.0, "valence_learning_rate": 1.0, "valence_decay": 1.0, "valence_threshold": 1.0}'
```
Modèle `ReinforcementConfigRequest` :
```json
{
  "extinction_k": 1.0,
  "valence_learning_rate": 1.0,
  "valence_decay": 1.0,
  "valence_threshold": 1.0
}
```
### `POST /v1/reinforcement-config/load-valence`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `load_valence`
- Source : `brainiak.old/core/api/v1_routes.py:875`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Load acquired word valences from disk.
```bash
curl -X POST "$BASE/v1/reinforcement-config/load-valence"
```
### `POST /v1/reinforcement-config/save-valence`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `save_valence`
- Source : `brainiak.old/core/api/v1_routes.py:867`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Persist acquired word valences to disk.
```bash
curl -X POST "$BASE/v1/reinforcement-config/save-valence"
```
### `POST /v1/reset-feedback`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `reset_feedback_state`
- Source : `brainiak.old/core/api/v1_routes.py:727`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Clear the last tokenless attempt — next prompt won't be treated as feedback.
```bash
curl -X POST "$BASE/v1/reset-feedback"
```
### `GET /v1/sensory/config`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_config`
- Source : `brainiak.old/core/api/sensory_routes.py:353`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Current NervousSystemConfig (37 tunable params).
```bash
curl -X GET "$BASE/v1/sensory/config"
```
### `PATCH /v1/sensory/config`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `patch_config`
- Source : `brainiak.old/core/api/sensory_routes.py:361`
- Paramètres : `—`
- Body / Form : `ConfigPatch`
- Response model : `—`
- Note handler : Hot-patch NervousSystemConfig parameters.
```bash
curl -X PATCH "$BASE/v1/sensory/config" -H 'Content-Type: application/json' -d '{"patch": {}}'
```
Modèle `ConfigPatch` :
```json
{
  "patch": {}
}
```
### `GET /v1/sensory/devices`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_devices`
- Source : `brainiak.old/core/api/sensory_routes.py:372`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : List available sensory devices and current routing.
```bash
curl -X GET "$BASE/v1/sensory/devices"
```
### `PUT /v1/sensory/devices/routing`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `set_routing`
- Source : `brainiak.old/core/api/sensory_routes.py:432`
- Paramètres : `—`
- Body / Form : `DeviceRouting`
- Response model : `—`
- Note handler : Set active device routing for each sense.
```bash
curl -X PUT "$BASE/v1/sensory/devices/routing" -H 'Content-Type: application/json' -d '{"vision": "string", "audition": "string", "voice_output": "string"}'
```
Modèle `DeviceRouting` :
```json
{
  "vision": "string",
  "audition": "string",
  "voice_output": "string"
}
```
### `GET /v1/sensory/state`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `sensory_state`
- Source : `brainiak.old/core/api/sensory_routes.py:259`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Full nervous system state: all R^6 vectors, security, curiosity, channels.
```bash
curl -X GET "$BASE/v1/sensory/state"
```
### `POST /v1/skinner`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `skinner_feedback`
- Source : `brainiak.old/core/api/v1_routes.py:1136`
- Paramètres : `—`
- Body / Form : `SkinnerRequest`
- Response model : `—`
- Note handler : POST /v1/skinner — Feedback Skinner immédiat sur la dernière réponse.
```bash
curl -X POST "$BASE/v1/skinner" -H 'Content-Type: application/json' -d '{"verdict": "string", "response_text": "string", "intensity": 1.0, "note": "string"}'
```
Modèle `SkinnerRequest` :
```json
{
  "verdict": "string",
  "response_text": "string",
  "intensity": 1.0,
  "note": "string"
}
```
### `GET /v1/system/checkup`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `system_checkup`
- Source : `brainiak.old/core/api/sensory_routes.py:444`
- Paramètres : `scale: str, category: str | None`
- Body / Form : `—`
- Response model : `—`
- Note handler : Run system checkup. scale=macro (binary) or micro (detailed). Optional category filter.
```bash
curl -X GET "$BASE/v1/system/checkup?scale=...&category=..."
```
### `GET /v1/system/diagnose`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `system_diagnose`
- Source : `brainiak.old/core/api/sensory_routes.py:452`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Auto-diagnostic: macro scan, then micro on non-OK systems. Returns issues + recommendations.
```bash
curl -X GET "$BASE/v1/system/diagnose"
```
### `POST /v1/teach`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teach_word`
- Source : `brainiak.old/core/api/v1_routes.py:584`
- Paramètres : `—`
- Body / Form : `TeachRequest`
- Response model : `—`
- Note handler : Teach a new word or refine an existing one.
```bash
curl -X POST "$BASE/v1/teach" -H 'Content-Type: application/json' -d '{"word": "string", "definition": "string", "session_id": "string"}'
```
Modèle `TeachRequest` :
```json
{
  "word": "string",
  "definition": "string",
  "session_id": "string"
}
```
### `POST /v1/teach-contrastive`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teach_contrastive`
- Source : `brainiak.old/core/api/v1_routes.py:604`
- Paramètres : `—`
- Body / Form : `TeachContrastiveRequest`
- Response model : `—`
- Note handler : Teach a word sense via contrastive pair (WSD self-learning).
```bash
curl -X POST "$BASE/v1/teach-contrastive" -H 'Content-Type: application/json' -d '{"word": "string", "sense_label": "string", "positive_context": "string", "negative_context": "string", "session_id": "string"}'
```
Modèle `TeachContrastiveRequest` :
```json
{
  "word": "string",
  "sense_label": "string",
  "positive_context": "string",
  "negative_context": "string",
  "session_id": "string"
}
```
### `GET /v1/teaching/status`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `teaching_status`
- Source : `brainiak.old/core/api/sensory_routes.py:1732`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Learning status — v7: bidirectional teacher R^14.
```bash
curl -X GET "$BASE/v1/teaching/status"
```
### `GET /v1/tokenless`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `get_tokenless_status`
- Source : `brainiak.old/core/api/v1_routes.py:715`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Check tokenless mode status.
```bash
curl -X GET "$BASE/v1/tokenless"
```
### `POST /v1/tokenless`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `toggle_tokenless`
- Source : `brainiak.old/core/api/v1_routes.py:698`
- Paramètres : `enable: bool`
- Body / Form : `query/form params`
- Response model : `—`
- Note handler : Toggle tokenless mode — BrainiaK speaks without Qwen.
```bash
curl -X POST "$BASE/v1/tokenless?enable=..."
```
### `POST /v1/tokenless_mode`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `set_tokenless_mode`
- Source : `brainiak.old/core/api/sensory_routes.py:55`
- Paramètres : `—`
- Body / Form : `dict`
- Response model : `—`
- Note handler : Toggle tokenless mode — when active, P:3 (Qwen) is disabled.
```bash
curl -X POST "$BASE/v1/tokenless_mode" -H 'Content-Type: application/json' -d '{"...": "dict"}'
```
### `POST /v1/tools/call`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `_call_tool`
- Source : `brainiak.old/core/api/app.py:272`
- Paramètres : `—`
- Body / Form : `ToolCallRequest`
- Response model : `ToolCallResponse`
```bash
curl -X POST "$BASE/v1/tools/call" -H 'Content-Type: application/json' -d '{"tool": "string", "arguments": {}, "role": "string", "forwarded": true}'
```
Modèle `ToolCallRequest` :
```json
{
  "tool": "string",
  "arguments": {},
  "role": "string",
  "forwarded": true
}
```
### `POST /v1/tools/call`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `call_tool`
- Source : `brainiak.old/tool_hub/main.py:103`
- Paramètres : `—`
- Body / Form : `ToolCallRequest`
- Response model : `ToolCallResponse`
- Note handler : Execute a tool. Routes locally or forwards to peer node.
```bash
curl -X POST "$BASE/v1/tools/call" -H 'Content-Type: application/json' -d '{"tool": "string", "arguments": {}, "role": "string", "forwarded": true}'
```
Modèle `ToolCallRequest` :
```json
{
  "tool": "string",
  "arguments": {},
  "role": "string",
  "forwarded": true
}
```
### `GET /v1/tools/list`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `_list_tools`
- Source : `brainiak.old/core/api/app.py:262`
- Paramètres : `role: str`
- Body / Form : `—`
- Response model : `—`
```bash
curl -X GET "$BASE/v1/tools/list?role=..."
```
### `GET /v1/tools/list`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `list_tools`
- Source : `brainiak.old/tool_hub/main.py:92`
- Paramètres : `role: str`
- Body / Form : `—`
- Response model : `—`
- Note handler : Return OpenAI function-calling schemas for tools accessible to this role.
```bash
curl -X GET "$BASE/v1/tools/list?role=..."
```
### `POST /v1/vision/frame`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `vision_frame`
- Source : `brainiak.old/core/api/sensory_routes.py:214`
- Paramètres : `source: str, client_ts: float | None`
- Body / Form : `multipart/form-data ; fichiers: image: UploadFile`
- Response model : `—`
- Note handler : Upload image frame → VisionEngine.
```bash
curl -X POST "$BASE/v1/vision/frame?source=...&client_ts=..." -F 'image=@/path/file' -F 'source=...' -F 'client_ts=...'
```
### `GET /v1/voice/last.wav`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `voice_last_wav`
- Source : `brainiak.old/core/api/sensory_routes.py:156`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Download last generated WAV (for debug/replay).
```bash
curl -X GET "$BASE/v1/voice/last.wav"
```
### `POST /v1/voice/speak`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `voice_speak`
- Source : `brainiak.old/core/api/sensory_routes.py:98`
- Paramètres : `—`
- Body / Form : `SpeakRequest`
- Response model : `—`
- Note handler : Speak text: emotion → prosody → TTS → WAV.
```bash
curl -X POST "$BASE/v1/voice/speak" -H 'Content-Type: application/json' -d '{"text": "string", "emotion_override": 1.0, "play_local": true, "client_ts": 1.0}'
```
Modèle `SpeakRequest` :
```json
{
  "text": "string",
  "emotion_override": 1.0,
  "play_local": true,
  "client_ts": 1.0
}
```
### `POST /v1/weights/save`
- Statut : **LEGACY_NON_MONTE**
- Type : **LEGACY / non montée**
- Handler : `save_weights`
- Source : `brainiak.old/core/api/v1_routes.py:1006`
- Paramètres : `—`
- Body / Form : `—`
- Response model : `—`
- Note handler : Persist LearningWeights + spider memory.
```bash
curl -X POST "$BASE/v1/weights/save"
```

## Annexe — modèles Pydantic détectés
### `AutoTask` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `id` | `str` | `Field(default_factory=lambda: uuid.uuid4().hex[:8])` |
| `name` | `str` | `requis` |
| `nodes` | `list[TaskNode]` | `requis` |
| `schedule` | `str | None` | `None` |
| `enabled` | `bool` | `True` |
| `last_run` | `str | None` | `None` |
| `last_status` | `str | None` | `None` |
| `last_output` | `str | None` | `None` |

### `BatchLookupRequest` — `brainiak/core/api/crystal_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `words` | `list[str]` | `requis` |
| `include_s5` | `bool` | `True` |

### `BootstrapRunRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `tenant_id` | `str` | `_DEV_TENANT_ID` |
| `n_runs` | `int` | `8` |

### `ChatMessage` — `deploy/vllm/mock_server.py`
| Champ | Type | Défaut |
|---|---|---|
| `role` | `str` | `requis` |
| `content` | `str` | `requis` |

### `ChatReq` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `message` | `str` | `requis` |
| `history` | `list[dict]` | `[]` |
| `mode` | `str` | `'normal'` |

### `ChatRequest` — `deploy/vllm/mock_server.py`
| Champ | Type | Défaut |
|---|---|---|
| `model` | `str` | `requis` |
| `messages` | `list[ChatMessage]` | `requis` |
| `max_tokens` | `int` | `512` |
| `temperature` | `float` | `0.0` |
| `stream` | `bool` | `False` |

### `ConfigPatch` — `brainiak/core/api/sensory_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `patch` | `dict` | `requis` |

### `CrystalInfo` — `brainiak/core/api/crystal_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `count` | `int` | `requis` |
| `path` | `str` | `requis` |
| `loaded_at` | `float` | `requis` |

### `CrystalResult` — `brainiak/core/api/crystal_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `word` | `str` | `requis` |
| `found` | `bool` | `requis` |
| `label` | `Optional[str]` | `None` |
| `r14` | `Optional[list[float]]` | `None` |
| `s5` | `Optional[list[float]]` | `None` |
| `r6_vis` | `Optional[list[float]]` | `None` |
| `r6_aud` | `Optional[list[float]]` | `None` |
| `o_sem` | `Optional[dict]` | `None` |
| `extra` | `Optional[dict]` | `None` |

### `DailyAggregateRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `date` | `str` | `requis` |

### `DevChatRequest` — `brainiak/core/api/dev_routes_legacy_v4.py`
| Champ | Type | Défaut |
|---|---|---|
| `messages` | `list[ChatMessage]` | `requis` |
| `max_tokens` | `Optional[int]` | `Field(default=None, ge=1)` |
| `max_turns` | `Optional[int]` | `Field(default=None, ge=1)` |
| `working_directory` | `str | None` | `None` |
| `enable_thinking` | `bool` | `False` |
| `session_id` | `str` | `Field(default='default', max_length=64)` |

### `DevChatResponse` — `brainiak/core/api/dev_routes_legacy_v4.py`
| Champ | Type | Défaut |
|---|---|---|
| `response` | `str` | `requis` |
| `final_answer` | `str` | `requis` |
| `tools_used` | `int` | `0` |

### `DevJobStatus` — `brainiak/core/api/dev_routes_legacy_v4.py`
| Champ | Type | Défaut |
|---|---|---|
| `job_id` | `str` | `requis` |
| `status` | `str` | `requis` |
| `tools_used` | `int` | `0` |
| `error` | `str | None` | `None` |

### `DeviceRouting` — `brainiak/core/api/sensory_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `vision` | `str` | `Field('usb', description='usb | browser | mobile_front | mobile_back')` |
| `audition` | `str` | `Field('usb', description='usb | browser | mobile')` |
| `voice_output` | `str` | `Field('browser', description='usb | browser | mobile')` |

### `DraftReq` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `doc` | `dict` | `requis` |
| `instruction` | `str` | `'Rédige une réponse professionnelle et concise.'` |

### `DraftRequest` — `apps/copilot/app.py`
| Champ | Type | Défaut |
|---|---|---|
| `doc` | `dict` | `requis` |
| `instruction` | `str` | `'Rédige une réponse professionnelle et concise.'` |

### `EditDefRequest` — `brainiak/core/api/teaching_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `word` | `str` | `requis` |
| `definition` | `str` | `requis` |

### `EncodeRequest` — `brainiak/core/api/crystal_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `text` | `str` | `requis` |
| `include_s5` | `bool` | `True` |

### `FeedbackRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `verdict` | `str` | `requis` |
| `word` | `str | None` | `None` |
| `text` | `str | None` | `None` |
| `session_id` | `str` | `'default'` |

### `FeedbackSenseRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `word` | `str` | `requis` |
| `sense_label` | `str` | `requis` |
| `verdict` | `str` | `requis` |
| `context_sentence` | `str` | `requis` |
| `session_id` | `str` | `'default'` |

### `FolderRequest` — `apps/copilot/app.py`
| Champ | Type | Défaut |
|---|---|---|
| `path` | `str` | `requis` |
| `cluster` | `bool` | `True` |

### `HealthResponse` — `brainiak/core/api/routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `status` | `str` | `requis` |
| `db` | `str` | `requis` |
| `version` | `str` | `'0.1.0'` |

### `InjectRequest` — `brainiak/core/api/sensory_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `vector` | `list[float]` | `Field(..., min_length=6, max_length=6)` |
| `source_tag` | `str` | `'injection'` |
| `client_ts` | `float | None` | `None` |

### `MathCorePipelineRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `tenant_id` | `str` | `requis` |
| `date` | `str` | `requis` |

### `ModeRequest` — `brainiak/core/api/teaching_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `mode` | `str` | `requis` |

### `NearestRequest` — `brainiak/core/api/crystal_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `r14` | `list[float]` | `requis` |
| `k` | `int` | `10` |
| `socle` | `str` | `'full'` |

### `NightlyBatchRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `date` | `str | None` | `None` |

### `PipelineControlRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `action` | `str` | `requis` |

### `PrimitiveCrystallizeRequest` — `brainiak/core/api/teaching_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `target` | `str` | `requis` |
| `primitive_type` | `str` | `requis` |
| `grammar_slots` | `dict` | `{}` |
| `reward` | `float` | `1.0` |

### `PromptRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `content` | `str | None` | `None` |
| `messages` | `list[ChatMessage] | None` | `None` |
| `session_id` | `str` | `'default'` |
| `tenant_id` | `str` | `_DEV_TENANT_ID` |
| `force_request` | `bool` | `False` |
| `enable_thinking` | `bool` | `False` |
| `stream` | `bool` | `True` |
| `mode` | `str | None` | `None` |
| `max_tokens` | `int` | `0` |
| `max_turns` | `int` | `0` |

### `PromptResponse` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `answer` | `str` | `requis` |
| `route` | `str` | `requis` |
| `mode` | `str` | `'normal'` |
| `total_steps` | `int` | `0` |
| `total_latency_ms` | `int` | `0` |
| `signals` | `dict[str, Any]` | `Field(default_factory=dict)` |
| `diagnostics` | `dict[str, Any] | None` | `None` |

### `QueryReq` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `docs` | `list[dict]` | `requis` |
| `query` | `str` | `requis` |

### `QueryRequest` — `apps/copilot/app.py`
| Champ | Type | Défaut |
|---|---|---|
| `docs` | `list[dict]` | `requis` |
| `query` | `str` | `requis` |

### `ReinforceRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `type` | `str` | `'reward'` |
| `intensity` | `float` | `0.7` |
| `target` | `str` | `'all'` |
| `correction_text` | `str | None` | `None` |
| `emotion_context` | `str | None` | `None` |

### `ReinforcementConfigRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `extinction_k` | `float | None` | `None` |
| `valence_learning_rate` | `float | None` | `None` |
| `valence_decay` | `float | None` | `None` |
| `valence_threshold` | `float | None` | `None` |

### `RequestAccepted` — `brainiak/core/api/routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `request_id` | `UUID` | `requis` |
| `execution_class` | `ExecutionClass` | `requis` |
| `status` | `RequestStatus` | `requis` |

### `RequestStatusResponse` — `brainiak/core/api/routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `request_id` | `UUID` | `requis` |
| `status` | `RequestStatus` | `requis` |
| `execution_class_pre` | `str | None` | `requis` |
| `execution_class_final` | `str | None` | `requis` |
| `prompt_machine` | `str | None` | `requis` |
| `created_at` | `datetime` | `requis` |
| `latency_ms` | `int | None` | `requis` |

### `SkinnerRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `verdict` | `str` | `requis` |
| `response_text` | `str` | `''` |
| `intensity` | `float` | `0.8` |
| `note` | `str` | `''` |

### `SpeakRequest` — `brainiak/core/api/sensory_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `text` | `str` | `requis` |
| `emotion_override` | `list[float] | None` | `None` |
| `play_local` | `bool` | `Field(False, description='Play on Jetson speaker (if /dev/snd available)')` |
| `client_ts` | `float | None` | `Field(None, description='Client-side timestamp (ms) for sync')` |

### `SumReq` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `docs` | `list[dict]` | `requis` |
| `keywords` | `list[str]` | `[]` |
| `size` | `int` | `0` |

### `SummarizeRequest` — `apps/copilot/app.py`
| Champ | Type | Défaut |
|---|---|---|
| `docs` | `list[dict]` | `requis` |
| `cluster_keywords` | `list[str]` | `[]` |
| `cluster_size` | `int` | `0` |

### `TaskNode` — `apps/copilot/server.py`
| Champ | Type | Défaut |
|---|---|---|
| `action` | `str` | `requis` |
| `instruction` | `str` | `requis` |

### `TeachContrastiveRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `word` | `str` | `requis` |
| `sense_label` | `str` | `requis` |
| `positive_context` | `str` | `requis` |
| `negative_context` | `str` | `''` |
| `session_id` | `str` | `'default'` |

### `TeachRequest` — `brainiak/core/api/v1_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `word` | `str` | `requis` |
| `definition` | `str` | `requis` |
| `session_id` | `str` | `'default'` |

### `TelemetryEventIn` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `event_type` | `str` | `'GRAPH_NODE_DONE'` |
| `node_id` | `str | None` | `None` |
| `latency_ms` | `int | None` | `None` |
| `outcome` | `str` | `'success'` |
| `tokens_in` | `int | None` | `None` |
| `tokens_out` | `int | None` | `None` |
| `metadata` | `dict | None` | `None` |

### `TelemetryIngestRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `events` | `list[TelemetryEventIn]` | `requis` |
| `tenant_id` | `str` | `_DEV_TENANT_ID` |

### `ToolCallRequest` — `brainiak/tool_hub/main.py`
| Champ | Type | Défaut |
|---|---|---|
| `tool` | `str` | `requis` |
| `arguments` | `dict` | `{}` |
| `role` | `str` | `'dev'` |
| `forwarded` | `bool` | `False` |

### `ToolCallResponse` — `brainiak/tool_hub/main.py`
| Champ | Type | Défaut |
|---|---|---|
| `success` | `bool` | `requis` |
| `output` | `str` | `requis` |
| `error` | `str | None` | `None` |
| `node` | `str` | `TOOLHUB_NODE` |
| `forwarded_to` | `str | None` | `None` |

### `WeeklyAggregateRequest` — `brainiak/core/api/admin_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `week_start` | `str` | `requis` |

### `_AppendSessionBody` — `brainiak/core/api/dev_routes_legacy_v4.py`
| Champ | Type | Défaut |
|---|---|---|
| `messages` | `list[_SessionMsg]` | `requis` |

### `_HeartbeatIntervalRequest` — `brainiak/core/api/sensory_routes.py`
| Champ | Type | Défaut |
|---|---|---|
| `interval` | `float` | `0` |

### `_SessionMsg` — `brainiak/core/api/dev_routes_legacy_v4.py`
| Champ | Type | Défaut |
|---|---|---|
| `role` | `str` | `Field(..., pattern='^(user|assistant)$')` |
| `content` | `str` | `requis` |

