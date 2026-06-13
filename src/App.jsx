import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard, BarChart3, Brain as BrainIcon, CheckSquare, CalendarDays,
  FolderKanban, Users, Briefcase, Settings as SettingsIcon, Bell, Search, Database,
  Sun, Moon, Plus, FolderPlus, Lightbulb, CalendarPlus, ChevronLeft, Folder, CircleCheck, User,
} from "lucide-react";
import { kvGet, kvSet, mirrorBackup, readMirror, cloudEnabled } from "./lib/storage.js";
import { DATA_KEY, SEED, migrate, todayISO, fmtTime, getProfile, saveProfile, hasSpaceParam, normalizeMembers, upsertMember, SHARED_KEY, SHARED_DEFAULT, tasksToShare, reconcileMirror } from "./lib/core.js";
import { CSS } from "./lib/theme.js";
import { cn } from "./lib/cn.js";
import ProfileGate from "./modules/ProfileGate.jsx";
import { Loader } from "./components/ui/loader.jsx";
import { Toasts, CommandPalette } from "./components.jsx";
import Dashboard from "./modules/Dashboard.jsx";
import DataView from "./modules/DataView.jsx";
import Brain from "./modules/Brain.jsx";
import Tasks from "./modules/Tasks.jsx";
import Agenda from "./modules/Agenda.jsx";
import Projects from "./modules/Projects.jsx";
import Shared from "./modules/Shared.jsx";
import Crm from "./modules/Crm.jsx";
import Settings from "./modules/Settings.jsx";

const SECTIONS = [
  { name: "Pilotage", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "data", label: "Data", icon: BarChart3 },
    { id: "brain", label: "Personal Brain", icon: BrainIcon },
  ] },
  { name: "Travail", items: [
    { id: "tasks", label: "Tâches", icon: CheckSquare },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
    { id: "projects", label: "Projets", icon: FolderKanban },
  ] },
  { name: "Collab", items: [
    { id: "shared", label: "Espace partagé", icon: Users },
    { id: "crm", label: "CRM", icon: Briefcase },
  ] },
];
const TITLES = { dashboard: "Dashboard", data: "Data", brain: "Personal Brain", tasks: "Tâches", agenda: "Agenda", projects: "Projets", shared: "Espace partagé", crm: "CRM", settings: "Réglages" };

export default function App() {
  const [data, setDataRaw] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [savedAt, setSavedAt] = useState(null);
  const [cmdk, setCmdk] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const [sharedMembers, setSharedMembers] = useState([]);
  const notifiedRef = useRef(new Set());
  const lastMirrorSig = useRef("");

  const pushToast = (text, kind = "info") => { const id = Math.random().toString(36).slice(2); setToasts((t) => [...t, { id, text, kind }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200); };
  const setData = (d) => setDataRaw(d);
  const update = (fn) => setDataRaw((d) => fn(structuredClone(d)));
  const goTo = (v) => { setView(v); setShowNotifs(false); };

  useEffect(() => {
    (async () => {
      let saved = await kvGet(DATA_KEY);
      // Cloud activé mais vide pour ce code → migrer les données locales existantes vers le cloud (aucune perte).
      if (cloudEnabled && (!saved || !saved.tasks)) {
        let local = null;
        try { const raw = localStorage.getItem(DATA_KEY); local = raw ? JSON.parse(raw) : null; } catch {}
        if (!local || !local.tasks) local = readMirror(DATA_KEY);
        if (local && local.tasks) saved = local;
      }
      // Filet de sécurité IMPORT V1 : si toujours rien, on récupère la plus grosse sauvegarde locale
      // tt:data:* (importe les tâches V1 même si le code de stockage a changé entre-temps).
      if (!saved || !saved.tasks || !saved.tasks.length) {
        try {
          let best = null;
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("tt:data:") && !k.endsWith(":backup")) {
              try { const v = JSON.parse(localStorage.getItem(k)); if (v && Array.isArray(v.tasks) && (!best || v.tasks.length > best.tasks.length)) best = v; } catch {}
            }
          }
          if (best && best.tasks && best.tasks.length) saved = best;
        } catch {}
      }
      if (!saved || !saved.tasks) saved = readMirror(DATA_KEY);
      if (saved && saved.tasks) { const m = migrate(saved); setDataRaw(m); if (cloudEnabled) kvSet(DATA_KEY, m); }
      else { const seed = structuredClone(SEED); setDataRaw(seed); kvSet(DATA_KEY, seed); }
      setLoaded(true);
    })();
  }, []);

  /* Auto-profil pour le propriétaire (hors invitation) une fois les données chargées. */
  useEffect(() => {
    if (!loaded || !data || profile || hasSpaceParam()) return;
    setProfile(saveProfile({ name: data.settings.userName || "Moi", color: data.settings.accent && data.settings.accent.startsWith("#") ? "#FAFAFA" : "#FAFAFA", role: "" }));
  }, [loaded, data, profile]);

  /* Enregistre / met à jour le membre courant dans l'espace partagé + charge la liste des membres. */
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const cur = normalizeMembers((await kvGet(SHARED_KEY)) || structuredClone(SHARED_DEFAULT));
      upsertMember(cur, profile);
      await kvSet(SHARED_KEY, cur);
      setSharedMembers(cur.members || []);
    })();
  }, [profile]);

  /* Miroir des tâches perso "watchpoint" / épinglées vers l'espace partagé (lecture seule). */
  useEffect(() => {
    if (!loaded || !data || !profile) return;
    const sig = JSON.stringify(tasksToShare(data).map((t) => [t.id, t.title, t.done, t.priority, t.date, t.teamAssignee || "", (t.tags || []).map((x) => String(x).toLowerCase())]));
    if (sig === lastMirrorSig.current) return;
    const h = setTimeout(async () => {
      lastMirrorSig.current = sig;
      const cur = normalizeMembers((await kvGet(SHARED_KEY)) || structuredClone(SHARED_DEFAULT));
      upsertMember(cur, profile);
      reconcileMirror(cur, data, profile);
      await kvSet(SHARED_KEY, cur);
      setSharedMembers(cur.members || []);
    }, 1300);
    return () => clearTimeout(h);
  }, [data, loaded, profile]);

  useEffect(() => {
    if (!loaded || !data) return;
    const t = setTimeout(async () => { const ok = await kvSet(DATA_KEY, data); mirrorBackup(DATA_KEY, data); if (ok) setSavedAt(Date.now()); }, 700);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const theme = (data && data.settings && data.settings.theme) || "dark";
  const accent = (data && data.settings && data.settings.accent) || "#2D6BFF";
  useEffect(() => { document.body.style.background = theme === "light" ? "#F6F6F8" : "#0A0A0C"; const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = theme === "light" ? "#F6F6F8" : "#0A0A0C"; }, [theme]);

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdk((s) => !s); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!loaded || !data) return;
    const check = () => {
      if (!data.settings.remindersOn) return;
      const now = new Date(); const lead = data.settings.reminderMinutes * 60000; const found = [];
      data.events.forEach((e) => { if (e.date === todayISO() && e.start) { const diff = new Date(`${e.date}T${e.start}`) - now; if (diff > 0 && diff <= lead && !notifiedRef.current.has("e" + e.id)) { notifiedRef.current.add("e" + e.id); found.push({ id: Math.random().toString(36).slice(2), text: `Événement à ${e.start} : ${e.title}`, ts: Date.now() }); } } });
      data.tasks.forEach((tk) => { if (!tk.done && tk.date === todayISO() && tk.time) { const diff = new Date(`${tk.date}T${tk.time}`) - now; if (diff > 0 && diff <= lead && !notifiedRef.current.has("t" + tk.id)) { notifiedRef.current.add("t" + tk.id); found.push({ id: Math.random().toString(36).slice(2), text: `Tâche à ${tk.time} : ${tk.title}`, ts: Date.now() }); } } });
      if (found.length) { setNotifs((n) => [...found, ...n].slice(0, 30)); found.forEach((f) => pushToast("🔔 " + f.text)); }
    };
    check(); const iv = setInterval(check, 60000); return () => clearInterval(iv);
  }, [loaded, data]);

  const itemsByDate = useMemo(() => {
    if (!data) return {};
    const map = {}; const push = (date, item) => { if (!date) return; (map[date] = map[date] || []).push(item); };
    data.events.forEach((e) => push(e.date, { type: "event", title: e.title, time: e.start }));
    data.tasks.forEach((t) => { if (!t.done) push(t.date, { type: "task", title: t.title, priority: t.priority, time: t.time }); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.time || "99").localeCompare(b.time || "99")));
    return map;
  }, [data]);

  const cmdkCommands = useMemo(() => {
    if (!data) return [];
    const out = [];
    [...SECTIONS.flatMap((s) => s.items), { id: "settings", label: "Réglages", icon: SettingsIcon }]
      .forEach((n) => out.push({ id: "go-" + n.id, label: n.label, icon: <n.icon size={18} />, group: "Aller à", keywords: [n.label], action: () => goTo(n.id) }));
    out.push({ id: "new-task", label: "Nouvelle tâche", icon: <Plus size={18} />, shortcut: "N", group: "Créer", keywords: ["ajouter", "todo"], action: () => goTo("tasks") });
    out.push({ id: "new-project", label: "Nouveau projet", icon: <FolderPlus size={18} />, group: "Créer", keywords: ["projet"], action: () => goTo("projects") });
    out.push({ id: "new-note", label: "Nouvelle note", icon: <Lightbulb size={18} />, group: "Créer", keywords: ["mémoire", "idée"], action: () => goTo("brain") });
    out.push({ id: "new-event", label: "Nouvel événement", icon: <CalendarPlus size={18} />, group: "Créer", keywords: ["agenda", "rdv"], action: () => goTo("agenda") });
    out.push({ id: "theme", label: theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre", icon: theme === "dark" ? <Sun size={18} /> : <Moon size={18} />, group: "Réglages", keywords: ["thème", "apparence"], action: () => update((d) => { d.settings.theme = d.settings.theme === "dark" ? "light" : "dark"; return d; }) });
    data.projects.forEach((p) => out.push({ id: "p-" + p.id, label: p.name, icon: <Folder size={18} />, group: "Projets", keywords: ["projet"], action: () => goTo("projects") }));
    data.tasks.forEach((t) => out.push({ id: "t-" + t.id, label: t.title, icon: <CircleCheck size={18} />, group: "Tâches", keywords: t.tags || [], action: () => goTo("tasks") }));
    data.notes.forEach((n) => out.push({ id: "n-" + n.id, label: n.title, icon: <Lightbulb size={18} />, group: "Mémoire", keywords: [], action: () => goTo("brain") }));
    data.contacts.forEach((c) => out.push({ id: "c-" + c.id, label: c.name, icon: <User size={18} />, group: "CRM", keywords: [c.company || ""], action: () => goTo("crm") }));
    return out;
  }, [data, theme]);

  if (!loaded || !data) {
    return <div className="tt-app tt-shell dark" data-theme="dark"><style>{CSS}</style><div className="grid h-full w-full place-items-center"><Loader /></div></div>;
  }

  /* Porte d'auth : invité (lien ?space=) sans profil → création de profil. */
  if (!profile && hasSpaceParam()) {
    return <div className={cn("tt-app tt-shell", theme === "dark" && "dark")} data-theme={theme}><style>{CSS}</style><ProfileGate onComplete={(p) => { setProfile(p); setView("shared"); }} /></div>;
  }

  const initials = (data.settings.userName || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const activeCount = data.tasks.filter((t) => !t.done).length;
  const navBtn = (active) => cn("group mb-0.5 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] transition-colors", active ? "bg-accent font-medium text-foreground" : "font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground");

  return (
    <div className={cn("tt-app tt-shell", theme === "dark" && "dark")} data-theme={theme}>
      <style>{CSS}</style>

      {/* ===== Sidebar (adaptée du composant 21st.dev — Tailwind + tokens shadcn) ===== */}
      <aside className={cn("flex flex-none flex-col border-r border-border bg-card py-5 transition-all duration-300 w-[72px] px-2.5", !collapsed && "lg:w-[268px] lg:px-4")}>
        <div className={cn("flex items-center justify-center gap-3 pb-4", !collapsed && "lg:justify-start lg:px-2")}>
          <div className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground">T</div>
          {!collapsed && <span className="hidden text-[15px] font-bold tracking-tight lg:inline">Tasks Tracker</span>}
          {!collapsed && <button onClick={() => setCollapsed(true)} className="ml-auto hidden h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:grid" title="Replier"><ChevronLeft size={16} /></button>}
        </div>
        {collapsed && <button onClick={() => setCollapsed(false)} className="mb-2 hidden h-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:grid" title="Déplier"><ChevronLeft size={16} className="rotate-180" /></button>}

        <button onClick={() => setCmdk(true)} className={cn("mb-3 flex items-center justify-center gap-2.5 rounded-[10px] border border-border bg-secondary px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", !collapsed && "lg:justify-start")}>
          <Search size={15} />{!collapsed && <span className="hidden lg:inline">Rechercher…</span>}{!collapsed && <kbd className="ml-auto hidden rounded-[5px] border border-border bg-card px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground lg:inline">⌘K</kbd>}
        </button>

        <nav className="flex-1 overflow-y-auto">
          {SECTIONS.map((sec) => (
            <div key={sec.name} className="mb-1">
              {!collapsed && <div className="hidden px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 lg:block">{sec.name}</div>}
              {sec.items.map((n) => (
                <button key={n.id} onClick={() => goTo(n.id)} title={n.label} className={cn(navBtn(view === n.id), "justify-center px-0", !collapsed && "lg:justify-start lg:px-3")}>
                  <n.icon size={18} className="flex-none" />
                  {!collapsed && <span className="hidden truncate lg:inline">{n.label}</span>}
                  {!collapsed && n.id === "tasks" && activeCount > 0 && <span className={cn("ml-auto hidden font-mono text-[11px] lg:inline", view === "tasks" ? "text-primary" : "text-muted-foreground")}>{activeCount}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-2">
          <button onClick={() => goTo("settings")} title="Réglages" className={cn(navBtn(view === "settings"), "justify-center px-0", !collapsed && "lg:justify-start lg:px-3")}>
            <SettingsIcon size={18} className="flex-none" />{!collapsed && <span className="hidden lg:inline">Réglages</span>}
          </button>
          <div className={cn("flex items-center justify-center gap-2 px-3 py-2 text-[11.5px] text-muted-foreground", !collapsed && "lg:justify-start")}>
            <span className={cn("h-[7px] w-[7px] flex-none rounded-full", cloudEnabled ? "bg-emerald-500" : "bg-muted-foreground")} />
            {!collapsed && <span className="hidden lg:inline">{cloudEnabled ? "Cloud" : "Local"}{savedAt ? " · " + fmtTime(savedAt) : ""}</span>}
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-none items-center justify-between border-b border-border bg-card px-8">
          <h1 className="text-[15px] font-bold tracking-tight">{TITLES[view]}</h1>
          <div className="relative flex items-center gap-2">
            <button onClick={() => setCmdk(true)} title="Recherche (⌘K)" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><Search size={18} /></button>
            <button onClick={() => update((d) => { d.settings.theme = theme === "dark" ? "light" : "dark"; return d; })} title="Thème" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => setShowNotifs((s) => !s)} className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><Bell size={18} />{notifs.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">{notifs.length}</span>}</button>
            {showNotifs && (
              <div className="absolute right-0 top-11 z-40 w-[312px] rounded-xl border border-border bg-popover p-3 shadow-xl">
                <div className="mb-2.5 flex items-center justify-between"><span className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">Notifications</span>{notifs.length > 0 && <button className="text-[12px] text-muted-foreground hover:text-foreground" onClick={() => setNotifs([])}>Tout effacer</button>}</div>
                {notifs.length === 0 && <div className="py-2.5 text-[12px] text-muted-foreground">Aucune notification.</div>}
                {notifs.map((n) => <div key={n.id} className="mb-1.5 rounded-lg bg-secondary px-2.5 py-2 text-[12.5px]">{n.text}<div className="mt-0.5 text-[10.5px] text-muted-foreground">{fmtTime(n.ts)}</div></div>)}
              </div>
            )}
            <div className="ml-1.5 grid h-9 w-9 place-items-center rounded-full bg-primary text-[12.5px] font-bold text-primary-foreground" title={data.settings.userName}>{initials}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background px-8 py-8" onClick={() => showNotifs && setShowNotifs(false)}>
          <div className="mx-auto flex min-h-full w-full max-w-[1360px] flex-col">
            {view === "dashboard" && <Dashboard data={data} update={update} itemsByDate={itemsByDate} goTo={goTo} setSelectedDate={setSelectedDate} />}
            {view === "data" && <DataView data={data} pushToast={pushToast} />}
            {view === "brain" && <Brain data={data} update={update} pushToast={pushToast} goTo={goTo} />}
            {view === "tasks" && <Tasks data={data} update={update} pushToast={pushToast} members={sharedMembers} profile={profile} />}
            {view === "agenda" && <Agenda data={data} update={update} itemsByDate={itemsByDate} pushToast={pushToast} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
            {view === "projects" && <Projects data={data} update={update} pushToast={pushToast} />}
            {view === "shared" && <Shared profile={profile} pushToast={pushToast} data={data} />}
            {view === "crm" && <Crm data={data} update={update} pushToast={pushToast} />}
            {view === "settings" && <Settings data={data} update={update} pushToast={pushToast} setData={setData} profile={profile} setProfile={setProfile} />}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdk} onClose={() => setCmdk(false)} commands={cmdkCommands} />
      <Toasts toasts={toasts} />
    </div>
  );
}
