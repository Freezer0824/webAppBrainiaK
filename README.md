# BrainiaK Frontend

Interface web BrainiaK Infini permettant aux conseillers, gestionnaires et opérateurs de piloter les différents modules BrainiaK avant raccordement complet au backend.

---

# Objectif

Ce frontend fournit une console métier unifiée pour :

* Assistant BrainiaK
* Boîte mail intelligente
* Centre de validations
* Dossiers clients
* COMPLISOFT
* RIBDC (Remplissage Intelligent BrainiaK de Documents Clients)
* Mails modèles
* Coffre-fort
* Paramètres
* Activité BrainiaK
* Sessions locales
* Observabilité runtime

L'ensemble des actions sensibles repose sur un principe fondamental :

> Aucune action métier critique n'est exécutée sans validation humaine.

---

# Stack technique

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* shadcn/ui
* lucide-react

---

# Architecture

```txt
src/
├── app/
│   └── App.tsx
│
├── components/
│   ├── infini/
│   │   ├── mailbox-dashboard.tsx
│   │   ├── validation-center.tsx
│   │   ├── client-files-dashboard.tsx
│   │   ├── complisoft-dashboard.tsx
│   │   ├── ribdc-dashboard.tsx
│   │   ├── template-mails-dashboard.tsx
│   │   ├── vault-dashboard.tsx
│   │   └── settings-dashboard.tsx
│   │
│   ├── shared/
│   └── ui/
│
├── features/
│   └── infini/
│
├── services/
│
├── store/
│
├── lib/
│
├── styles/
│
└── types/
```

---

# Navigation métier

## Accueil

Vue d'ensemble de l'activité BrainiaK.

---

## Assistant BrainiaK

Chat conversationnel principal.

Fonctionnalités :

* conversations locales
* historique
* streaming
* génération BrainiaK
* activités outils
* raisonnement

---

# Boîte Mail

Module de traitement intelligent des emails.

## Fonctionnalités

### Consultation

* liste des mails
* recherche
* filtres avancés
* priorités

### Actions BrainiaK

Pour chaque mail :

* Résumer
* Préparer une réponse
* Préparer une relance

### Workflow

```txt
À traiter
    ↓
Préparé
    ↓
En validation
    ↓
Validé / Refusé
    ↓
Envoyé
    ↓
Archivé
```

### Validation humaine

Aucun mail ne peut être envoyé automatiquement.

### Gestion avancée

* édition des résultats générés
* suppression
* ajout de pièces jointes
* suppression de pièces jointes
* ajout au centre de validation

### Synchronisation validations

Suppression d'une validation :

```txt
3/3 validations
↓
2/3 validations
```

L'action correspondante redevient disponible.

Si toutes les validations sont supprimées :

```txt
En validation
↓
À traiter
```

Tous les boutons redeviennent utilisables.

---

# Centre de validations

Module transversal de validation humaine.

## Sources supportées

* Mail
* COMPLISOFT
* RIBDC
* Dossiers clients
* Coffre-fort
* Templates
* Paramètres

## Actions

### Analyse BrainiaK

* Analyse avant validation
* Explication du risque

### Décisions humaines

* Valider
* Refuser
* Supprimer

## Gestion des risques

Niveaux :

* Faible
* Moyen
* Élevé

## Synchronisation

Une décision de validation est propagée au module d'origine.

---

# Dossiers Clients

Gestion centralisée des dossiers clients.

## Fonctionnalités prévues

* liste des dossiers
* état du dossier
* documents disponibles
* documents manquants
* analyse BrainiaK
* prochaines actions recommandées

---

# COMPLISOFT

Préparation des données destinées à COMPLISOFT.

## Fonctionnalités prévues

* préparation dossier
* contrôle complétude
* vérification conformité
* pré-synchronisation
* validation humaine avant envoi

---

# RIBDC

Remplissage Intelligent BrainiaK de Documents Clients.

## Objectif

Préremplir automatiquement des formulaires à partir des données déjà disponibles.

## Fonctionnalités

### Upload

* ajout de formulaires
* gestion de plusieurs dossiers

### Analyse

BrainiaK peut :

* détecter les champs
* identifier les données disponibles
* détecter les données manquantes

### Génération

* préremplissage automatique
* rapport de contrôle
* liste des champs manquants

### Validation

Le document final doit être validé avant utilisation.

---

# Mails Modèles

Gestion des modèles d'emails.

## Fonctionnalités prévues

* bibliothèque de modèles
* variables dynamiques
* aperçu
* génération automatique
* validation avant utilisation

---

# Coffre-fort

Gestion sécurisée des accès métiers.

## Fonctionnalités prévues

* consultation des accès
* informations de connexion
* checklist sécurité
* audit des utilisations

---

# Paramètres

Configuration de BrainiaK Infini.

## Fonctionnalités prévues

* état des connecteurs
* configuration backend
* mode démonstration
* état de santé des modules

---

# Persistance locale

Le frontend utilise actuellement :

```txt
Zustand Persist
+
LocalStorage
```

pour :

* mails
* validations
* activités
* sessions
* résultats BrainiaK

---

# Services BrainiaK

Les services métier sont actuellement encapsulés dans :

```txt
src/services/
```

Exemples :

```txt
mailbox.service.ts
validation.service.ts
ribdc.service.ts
complisoft.service.ts
```

Le backend réel pourra être branché sans modifier les composants UI.

---

# Variables d'environnement

Créer un fichier :

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_TENANT_ID=dev
```

Exemple production :

```env
VITE_API_BASE_URL=https://brainiak.company.local
VITE_TENANT_ID=infini
```

---

# Installation

```bash
npm install
```

---

# Développement

```bash
npm run dev
```

Application disponible sur :

```txt
http://localhost:5173
```

---

# Build

```bash
npm run build
```

---

# Prévisualisation locale

```bash
npm run preview
```

---

# Réinitialisation des données locales

Pour supprimer tous les états persistés :

```javascript
localStorage.clear();
location.reload();
```

ou via DevTools :

```txt
Application
→ Local Storage
→ Clear All
```

---

# Validation manuelle avant livraison

Vérifier :

## Boîte mail

* génération résumé
* génération réponse
* génération relance
* ajout validation
* suppression validation
* réactivation des boutons
* changement d'état du mail

## Validations

* analyse BrainiaK
* explication risque
* validation
* refus
* suppression

## RIBDC

* ajout formulaire
* génération préremplissage
* génération rapport
* validation

## Navigation

* tous les onglets accessibles
* responsive
* persistance des données
* rafraîchissement de page

---

# État actuel

## Fonctionnel

* Assistant BrainiaK
* Boîte mail
* Centre de validations
* Workflow de validation
* Persistance Zustand
* RIBDC (version démonstration)

## En préparation backend

* Dossiers clients
* COMPLISOFT
* Coffre-fort
* Mails modèles
* Connecteurs réels
* Synchronisation métier réelle

---

# Philosophie BrainiaK

BrainiaK assiste l'utilisateur.

BrainiaK propose.

L'humain décide.

Aucune action métier sensible n'est exécutée sans validation humaine.
