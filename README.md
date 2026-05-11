
# BrainiaK Frontend

Interface web BrainiaK Control Console pour exploiter les routes exposées du Core BrainiaK.

## Objectif

Ce frontend fournit une console unifiée pour piloter les capacités principales de BrainiaK :

- Assistant principal
- Requests Core
- Dev Chat
- Tools
- Modes
- Sensory
- Crystals
- Learning
- System Checkup
- Sessions locales
- Tool Activity global
- Observabilité runtime

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- shadcn/ui
- lucide-react

## Structure principale

```txt
src/
├── app/
│   └── App.tsx
├── components/
│   ├── shared/
│   └── ui/
├── features/
│   ├── chat/
│   ├── reasoning/
│   └── runtime/
├── lib/
│   ├── api/
│   ├── config/
│   └── session/
├── store/
├── styles/
└── types/
````

## Fonctionnalités

### Assistant

* Envoi de prompt via `/v1/prompt`
* Streaming SSE
* Stop prompt
* Retry
* Upload fichiers
* Mode raison local
* Gestion d’erreurs backend
* Détection de `(no answer produced)`

### Requests

Routes :

```txt
POST /v0/request
GET  /v0/request/{request_id}/status
GET  /v0/request/{request_id}/response
```

### Dev Chat

Routes :

```txt
POST   /v0/dev/chat
POST   /v0/dev/chat/stream
POST   /v0/dev/chat/async
GET    /v0/dev/chat/{job_id}/status
GET    /v0/dev/chat/{job_id}/result
GET    /v0/dev/session
POST   /v0/dev/session/messages
DELETE /v0/dev/session
```

### Tools

Routes :

```txt
GET  /toolhub/health
GET  /v1/tools/list
POST /v1/tools/call
```

### Modes

Routes :

```txt
GET    /v1/modes
POST   /v1/modes
POST   /v1/modes/{mode_name}
DELETE /v1/modes/{mode_name}
DELETE /v1/modes
```

### Sensory

Inclut :

* State
* Config
* Devices
* Heartbeat
* Audio
* Vision
* Voice
* Events

### Crystals

Routes :

```txt
GET  /v1/crystals/info
GET  /v1/crystals/lookup
POST /v1/crystals/lookup_batch
GET  /v1/crystals/encode
POST /v1/crystals/nearest
```

### Learning

Routes :

```txt
POST /v1/feedback
POST /v1/feedback-sense
POST /v1/skinner
POST /v1/teach
POST /v1/teach-contrastive
GET  /v1/tokenless
POST /v1/tokenless
```

### System

Route :

```txt
GET /v1/system/checkup
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L’application démarre par défaut sur :

```txt
http://localhost:5173
```

## Build

```bash
npm run build
```

## Preview production locale

```bash
npm run preview
```

## Variables d’environnement

Créer un fichier `.env` :

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_TENANT_ID=dev
```

Adapter selon l’URL réelle du backend BrainiaK.

## Validation manuelle

Avant chaque push important :

```bash
npm run build
```

À vérifier :

* navigation sur toutes les vues
* création session
* sélection session
* renommage session
* archivage/restauration session
* suppression session
* duplication session
* export JSON/Markdown
* boutons refresh
* boutons submit
* erreurs backend visibles
* Tool Activity mis à jour
* responsive fenêtre réduite/fullscreen

## Notes

Les sessions sont actuellement stockées côté frontend via Zustand persist/local storage.

Certaines routes dépendent de services backend actifs : LLM, Tool Hub, Sensory, Crystals, etc.
