# Tasks Tracker

App de productivité — agenda, tâches, projets, espace partagé, CRM.
Stack : Vite + React. Police Inter. Stockage : Supabase (cloud) ou localStorage (repli).

## 1. Lancer en local

```bash
npm install
npm run dev
```

## 2. Déployer sur Vercel

**Option A — CLI (le plus rapide) :**
```bash
npm i -g vercel        # si pas déjà installé
vercel                 # depuis ce dossier, réponds aux questions (framework: Vite, détecté automatiquement)
vercel --prod          # déploiement en production
```

**Option B — GitHub :**
1. Pousse ce dossier sur un repo GitHub.
2. vercel.com → Add New → Project → importe le repo.
3. Framework preset : **Vite** (détecté automatiquement). Build : `npm run build`, output : `dist`. Deploy.

L'app fonctionne immédiatement en **mode local** (localStorage).

## 3. Activer la persistance cloud (recommandé)

Sans cette étape : les données restent dans le navigateur (perdues si tu vides le cache),
et l'espace partagé n'est pas synchronisé entre utilisateurs.

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. SQL Editor → colle le contenu de `supabase.sql` → Run.
3. Project Settings → API : copie l'**URL** et la clé **anon public**.
4. Dans Vercel → ton projet → Settings → Environment Variables, ajoute :
   - `VITE_SUPABASE_URL` = l'URL du projet
   - `VITE_SUPABASE_ANON_KEY` = la clé anon
5. Redéploie (Deployments → ⋯ → Redeploy).

La pastille en bas de la sidebar passe en vert « Cloud ».

## 4. Codes de synchronisation

- **Code personnel** (Paramètres → Synchronisation) : identifie TES données dans le cloud.
  Note-le. Pour retrouver tes données sur un autre appareil/navigateur : colle le code → Utiliser.
- **Code d'espace partagé** : identifie l'espace d'équipe. Le bouton **Inviter** copie un lien
  `?space=...` — toute personne qui l'ouvre rejoint l'espace (discussion, tâches, dropbox).

## 5. Calendriers Google / Apple

Import/export `.ics` dans Paramètres (compatible Google Agenda et Apple Calendar, deux sens).
La synchro OAuth temps réel nécessiterait un backend dédié — extension possible plus tard.

## Sécurité (à savoir)

La table `kv` est ouverte à quiconque possède la clé anon (qui est embarquée dans le front).
C'est acceptable pour un outil interne dont l'URL reste privée ; pour durcir, ajouter
Supabase Auth + Row Level Security par utilisateur.
