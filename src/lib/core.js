/* ============================================================================
   core.js — modèle de données v2, utilitaires, migration, intelligence, activité
   Pur JavaScript (aucun JSX). Importé par les modules et la coquille App.
   ========================================================================== */

/* ----------------------------- Identifiants ----------------------------- */
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);

/* ------------------------------- Dates ---------------------------------- */
export const pad = (n) => String(n).padStart(2, "0");
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => iso(new Date());
export const dPlus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
export const addDays = (isoStr, n) => {
  const [y, m, d] = isoStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return iso(dt);
};
export const daysBetween = (aISO, bISO) => {
  const a = new Date(aISO + "T00:00:00"), b = new Date(bISO + "T00:00:00");
  return Math.round((b - a) / 86400000);
};

export const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
export const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DOWS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
export const DOWS_L = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

/* --------------------------- Référentiels ------------------------------- */
export const PRIOS = {
  1: { label: "Urgente", short: "U", color: "var(--rd)" },
  2: { label: "Haute",   short: "H", color: "var(--ac)" },
  3: { label: "Normale", short: "N", color: "var(--t2b)" },
  4: { label: "Basse",   short: "B", color: "var(--t3)" },
};
export const STATUS = {
  todo:    { label: "À faire",  color: "var(--t2)" },
  doing:   { label: "En cours", color: "var(--ac)" },
  blocked: { label: "Bloquée",  color: "var(--am)" },
  done:    { label: "Terminée", color: "var(--gn)" },
};
export const PROJ_STATUS = {
  active: { label: "Actif",   color: "var(--gn)" },
  paused: { label: "En pause",color: "var(--am)" },
  done:   { label: "Terminé", color: "var(--t2)" },
};
export const STAGES = ["Lead", "Contacté", "Proposition", "Client"];
export const PALETTE = ["#2D6BFF","#22c55e","#ef4444","#f59e0b","#a855f7","#14b8a6","#ec4899","#8a8a94"];

/* ------------------------------ Formats --------------------------------- */
export function fmtNice(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOWS_L[(dt.getDay() + 6) % 7]}. ${d} ${MONTHS[m - 1].slice(0, 4)}.`;
}
export function fmtLong(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOWS_L[(dt.getDay() + 6) % 7]} ${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtSize(b) {
  if (b == null) return "";
  if (b < 1024) return b + " o";
  if (b < 1048576) return (b / 1024).toFixed(0) + " Ko";
  return (b / 1048576).toFixed(1) + " Mo";
}
export function fmtTime(ts) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/* Temps relatif court : "à l'instant", "il y a 12 min", "hier", "il y a 3 j" */
export function relTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24 && new Date(ts).getDate() === new Date().getDate()) return `il y a ${h} h`;
  const d = Math.floor(diff / 86400000);
  if (d < 1) return `il y a ${h} h`;
  if (d === 1) return "hier";
  if (d < 30) return `il y a ${d} j`;
  return iso(new Date(ts));
}

/* ------------------------------ Fichiers -------------------------------- */
export function readFiles(list) {
  return Promise.all(Array.from(list).map((f) => new Promise((res) => {
    const base = { id: uid(), name: f.name, size: f.size, type: f.type, ts: Date.now(), content: null };
    if (f.size < 1800000) {
      const r = new FileReader();
      r.onload = () => res({ ...base, content: r.result });
      r.onerror = () => res(base);
      r.readAsDataURL(f);
    } else res(base);
  })));
}
export function download(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

/* ------------------------- ICS (Google / Apple) ------------------------- */
export function parseICS(text) {
  const events = [];
  const blocks = String(text).split("BEGIN:VEVENT").slice(1);
  for (const b of blocks) {
    const body = b.split("END:VEVENT")[0];
    const get = (prop) => {
      const m = body.match(new RegExp("^" + prop + "[^:\\r\\n]*:(.*)$", "m"));
      return m ? m[1].trim() : null;
    };
    const dtstart = get("DTSTART");
    if (!dtstart) continue;
    const d = dtstart.replace(/[^0-9T]/g, "");
    if (d.length < 8) continue;
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    let start = null, end = null;
    if (d.includes("T")) start = `${d.slice(9, 11)}:${d.slice(11, 13)}`;
    const dtend = get("DTEND");
    if (dtend) {
      const e = dtend.replace(/[^0-9T]/g, "");
      if (e.includes("T")) end = `${e.slice(9, 11)}:${e.slice(11, 13)}`;
    }
    events.push({
      id: uid(), title: (get("SUMMARY") || "Événement").replace(/\\,/g, ","),
      date, start, end, allDay: !start, location: get("LOCATION") || "", url: "",
      projectId: null, notes: "", source: "ics",
    });
  }
  return events;
}
export function buildICS(events, tasks) {
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tasks Tracker//FR"];
  const stamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  events.forEach((e) => {
    const d = e.date.replace(/-/g, "");
    L.push("BEGIN:VEVENT", `UID:${e.id}@taskstracker`, `DTSTAMP:${stamp}`);
    if (e.start) L.push(`DTSTART:${d}T${e.start.replace(":", "")}00`);
    else L.push(`DTSTART;VALUE=DATE:${d}`);
    if (e.end) L.push(`DTEND:${d}T${e.end.replace(":", "")}00`);
    L.push(`SUMMARY:${e.title}`);
    if (e.location) L.push(`LOCATION:${e.location}`);
    L.push("END:VEVENT");
  });
  tasks.filter((t) => t.date && !t.done).forEach((t) => {
    const d = t.date.replace(/-/g, "");
    L.push("BEGIN:VEVENT", `UID:${t.id}@taskstracker`, `DTSTAMP:${stamp}`);
    if (t.time) L.push(`DTSTART:${d}T${t.time.replace(":", "")}00`);
    else L.push(`DTSTART;VALUE=DATE:${d}`);
    L.push(`SUMMARY:[Tâche] ${t.title}`, "END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

/* --------------------------- Codes de synchro --------------------------- */
export function getPersonalCode() {
  let c = localStorage.getItem("tt:code");
  if (!c) { c = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6); localStorage.setItem("tt:code", c); }
  return c;
}
export function getSpaceCode() {
  const fromUrl = new URLSearchParams(window.location.search).get("space");
  if (fromUrl) { localStorage.setItem("tt:space", fromUrl); return fromUrl; }
  let c = localStorage.getItem("tt:space");
  if (!c) { c = "equipe-" + Math.random().toString(36).slice(2, 7); localStorage.setItem("tt:space", c); }
  return c;
}
export function inviteUrl() {
  return `${window.location.origin}${window.location.pathname}?space=${encodeURIComponent(getSpaceCode())}`;
}
export const SHARED_KEY = "tt:shared:" + getSpaceCode();
export const DATA_KEY = "tt:data:" + getPersonalCode();
export const SHARED_DEFAULT = { name: "", members: [], messages: [], tasks: [], files: [] };

/* ----------------------- Profils & membres (auth légère) ---------------- */
export const MEMBER_COLORS = ["#FAFAFA", "#9CA3AF", "#22C55E", "#F59E0B", "#60A5FA", "#A78BFA", "#F472B6", "#34D399"];
export const ROLE_SUGGESTIONS = ["Membre", "Manager", "Designer", "Développeur", "Marketing", "Finance", "Produit", "Sales"];

export function getMyId() {
  let id = localStorage.getItem("tt:pid");
  if (!id) { id = "u_" + uid(); localStorage.setItem("tt:pid", id); }
  return id;
}
export function getProfile() {
  try { const p = localStorage.getItem("tt:profile"); return p ? JSON.parse(p) : null; } catch { return null; }
}
export function saveProfile(p) {
  const prof = { id: getMyId(), name: (p.name || "").trim(), color: p.color || "#FAFAFA", role: (p.role || "").trim(), createdAt: p.createdAt || Date.now() };
  try { localStorage.setItem("tt:profile", JSON.stringify(prof)); } catch {}
  return prof;
}
export function hasSpaceParam() {
  return !!new URLSearchParams(window.location.search).get("space");
}
export function initials(name) {
  return (name || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}
/* Convertit d'anciens membres (strings) en objets profil, sans perte. */
export function normalizeMembers(shared) {
  if (!shared) return shared;
  shared.members = (shared.members || []).map((m, i) =>
    typeof m === "string" ? { id: "legacy_" + m.toLowerCase().replace(/\s+/g, "-"), name: m, color: MEMBER_COLORS[i % MEMBER_COLORS.length], role: "" } : m
  );
  return shared;
}
/* Enregistre / met à jour le profil courant dans la liste des membres de l'espace. */
export function upsertMember(shared, profile) {
  if (!shared.members) shared.members = [];
  const i = shared.members.findIndex((m) => m.id === profile.id);
  const entry = { id: profile.id, name: profile.name, color: profile.color, role: profile.role, joinedAt: (i >= 0 ? shared.members[i].joinedAt : Date.now()), lastSeen: Date.now() };
  if (i >= 0) shared.members[i] = entry; else shared.members.push(entry);
  return shared;
}

/* ------------------ Productivité par personne (espace partagé) ---------- */
export function computeMemberStats(shared) {
  const members = (shared && shared.members) || [];
  const tasks = (shared && shared.tasks) || [];
  return members.map((m) => {
    const assigned = tasks.filter((t) => t.assignee === m.id);
    const completedAssigned = assigned.filter((t) => t.done).length;
    const completedTotal = tasks.filter((t) => t.done && (t.doneBy === m.id || (!t.doneBy && t.assignee === m.id))).length;
    return { ...m, assigned: assigned.length, completedAssigned, completedTotal, rate: assigned.length ? Math.round((completedAssigned / assigned.length) * 100) : 0 };
  }).sort((a, b) => b.completedTotal - a.completedTotal || b.completedAssigned - a.completedAssigned || a.name.localeCompare(b.name));
}
export function computeSharedTotals(shared) {
  const tasks = (shared && shared.tasks) || [];
  const done = tasks.filter((t) => t.done).length;
  return { total: tasks.length, done, open: tasks.length - done, rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0, members: ((shared && shared.members) || []).length };
}

/* ----- Miroir des tâches perso → espace partagé (lecture seule, par membre) ----- */
/* Une tâche perso part dans le partagé si elle a le tag "watchpoint" OU teamShare=true. */
export function isWatchpointTagged(t) {
  return (t.tags || []).map((x) => String(x).toLowerCase()).includes("watchpoint");
}
export function tasksToShare(personalData) {
  return (personalData.tasks || []).filter((t) => t.teamShare === true || isWatchpointTagged(t));
}
/* Reconcilie les tâches mirrorées du membre courant : ne touche QUE celles dont
   origin.ownerId === profile.id (les autres membres gèrent les leurs). */
export function reconcileMirror(sharedDoc, personalData, profile) {
  if (!sharedDoc.tasks) sharedDoc.tasks = [];
  const owner = profile.id;
  const ownerName = profile.name;
  const mirrored = tasksToShare(personalData).map((t) => {
    const assignee = t.teamAssignee || owner;
    return {
      id: "mir:" + owner + ":" + t.id,
      title: t.title, priority: t.priority || 3,
      done: !!t.done, doneAt: t.doneAt || null, doneBy: t.done ? assignee : null,
      assignee, date: t.date || null, author: ownerName,
      mirror: true, category: isWatchpointTagged(t) ? "watchpoint" : null,
      origin: { ownerId: owner, taskId: t.id },
    };
  });
  const others = sharedDoc.tasks.filter((t) => !(t.origin && t.origin.ownerId === owner));
  sharedDoc.tasks = [...others, ...mirrored];
  return sharedDoc;
}

/* ------------------------------- Activité ------------------------------- */
/* Journal append-only : la mémoire traçable du Personal Brain.
   Appelé À L'INTÉRIEUR d'un update(), mute directement l'objet data. */
export function pushAct(d, type, summary, meta = {}) {
  if (!d.activity) d.activity = [];
  d.activity.unshift({ id: uid(), ts: Date.now(), actor: (d.settings && d.settings.userName) || "moi", type, summary, ...meta });
  if (d.activity.length > 600) d.activity.length = 600;
  return d;
}
export const ACT_ICON = {
  "task.create": "plus", "task.edit": "edit", "task.done": "check", "task.reopen": "rotate",
  "task.delete": "trash", "task.move": "arrows-sort",
  "event.create": "calendar-plus", "event.edit": "edit", "event.delete": "trash",
  "project.create": "folder-plus", "project.edit": "edit", "project.delete": "trash",
  "file.add": "paperclip", "file.remove": "x",
  "contact.create": "user-plus", "contact.edit": "edit", "contact.move": "arrow-right", "contact.delete": "trash",
  "note.create": "bulb", "note.edit": "edit", "note.delete": "trash",
};

/* -------------------------------- SEED ---------------------------------- */
export const SEED = {
  v: 2,
  tasks: [
    { id: "t1", title: "Finaliser le contrat Valentin Parisot", notes: "Vérifier les clauses BlueCrest + option equity.", date: todayISO(), time: "14:00", durationMin: 0, priority: 1, status: "doing", projectId: "p1", tags: ["legal","equity","watchpoint"], subtasks: [{ id: uid(), title: "Vérifier les clauses", done: true }, { id: uid(), title: "Valider l'option BSA", done: false }], links: [], teamShare: false, teamAssignee: null, done: false, files: [], createdAt: Date.now() - 3 * 86400000, updatedAt: Date.now() },
    { id: "t2", title: "Préparer le deck investisseur pré-seed", notes: "", date: todayISO(), time: "", durationMin: 0, priority: 2, status: "todo", projectId: "p1", tags: [], subtasks: [], links: [], done: false, files: [], createdAt: Date.now() - 86400000, updatedAt: Date.now() },
    { id: "t3", title: "Réviser Customer Experience (ECNU)", notes: "", date: dPlus(1), time: "", durationMin: 0, priority: 3, status: "todo", projectId: null, tags: [], subtasks: [], links: [], done: false, files: [], createdAt: Date.now(), updatedAt: Date.now() },
  ],
  events: [
    { id: "e1", title: "Call Léo — roadmap Watchpoint", date: todayISO(), start: "18:00", end: "19:00", allDay: false, location: "Google Meet", url: "", projectId: "p1", notes: "", source: "local" },
  ],
  projects: [
    { id: "p1", name: "Watchpoint", color: "#2D6BFF", desc: "Market intelligence — montres de luxe", status: "active", dueDate: "", files: [], links: [], notes: "", createdAt: Date.now() - 12 * 86400000, updatedAt: Date.now() },
  ],
  contacts: [
    { id: "c1", name: "Anthony Broto", company: "Investisseur pré-seed", email: "", phone: "", stage: "Proposition", value: 10000, notes: "5% via augmentation de capital réservée + BSA.", tags: [], files: [] },
  ],
  notes: [
    { id: "n1", title: "Thèse Watchpoint", body: "Modèle IA propre · 3000$ de crédits obtenus · relié au [[Deck]] investisseur.", projectId: "p1", taskIds: [], pinned: true, createdAt: Date.now() - 2 * 86400000, updatedAt: Date.now() - 2 * 86400000 },
  ],
  activity: [
    { id: uid(), ts: Date.now() - 2 * 86400000, actor: "Louis", type: "project.create", summary: "Projet « Watchpoint » créé", entity: "project", entityId: "p1" },
  ],
  brainFiles: [],
  settings: { userName: "Louis", theme: "dark", accent: "#2D6BFF", density: "cozy", lang: "fr", remindersOn: true, reminderMinutes: 30 },
};

/* ------------------------------ Migration ------------------------------- */
/* Adapte une sauvegarde v1 (ou partielle) au schéma v2 SANS perdre de données. */
export function migrate(data) {
  if (!data || typeof data !== "object") return structuredClone(SEED);
  const d = structuredClone(data);
  d.v = 2;
  d.tasks = (d.tasks || []).map((t) => ({
    durationMin: 0, status: t.done ? "done" : "todo", tags: [], subtasks: [], links: [],
    teamShare: false, teamAssignee: null,
    updatedAt: t.createdAt || Date.now(), ...t,
    done: !!t.done, files: t.files || [], priority: t.priority || 3, projectId: t.projectId ?? null,
  }));
  d.events = (d.events || []).map((e) => ({
    allDay: !e.start, url: "", projectId: null, notes: "", ...e,
  }));
  d.projects = (d.projects || []).map((p) => ({
    status: "active", dueDate: "", links: [], notes: "", createdAt: Date.now(), updatedAt: Date.now(), ...p,
    files: p.files || [],
  }));
  d.contacts = (d.contacts || []).map((c) => ({ tags: [], files: [], ...c }));
  d.notes = d.notes || [];
  d.activity = d.activity || [];
  d.brainFiles = d.brainFiles || []; /* mémoire générale du Personal Brain (fichiers sans projet) */
  d.settings = {
    userName: "moi", theme: "dark", accent: "#2D6BFF", density: "cozy", lang: "fr",
    remindersOn: true, reminderMinutes: 30, ...(d.settings || {}),
  };
  return d;
}

/* --------------------- Intelligence : insights calculés ----------------- */
export function computeInsights(data) {
  const out = [];
  const today = todayISO();
  const late = data.tasks.filter((t) => !t.done && t.date && t.date < today);
  if (late.length) out.push({ icon: "alert-triangle", tone: "rd", text: `${late.length} tâche${late.length > 1 ? "s" : ""} en retard`, action: { view: "tasks", filter: "late" } });

  const todayLoad = data.tasks.filter((t) => !t.done && t.date === today);
  if (todayLoad.length >= 5) out.push({ icon: "stack-2", tone: "am", text: `Journée chargée : ${todayLoad.length} tâches aujourd'hui`, action: { view: "tasks", filter: "today" } });

  data.projects.forEach((p) => {
    if (p.status !== "active") return;
    const acts = data.activity.filter((a) => a.entityId === p.id || (a.meta && a.meta.projectId === p.id) || a.projectId === p.id);
    const lastTs = acts.length ? Math.max(...acts.map((a) => a.ts)) : (p.updatedAt || p.createdAt || 0);
    const days = Math.floor((Date.now() - lastTs) / 86400000);
    if (days >= 10) out.push({ icon: "zzz", tone: "t3", text: `${p.name} inactif depuis ${days} j`, action: { view: "projects" } });
  });

  data.projects.forEach((p) => {
    const pts = data.tasks.filter((t) => t.projectId === p.id);
    const done = pts.filter((t) => t.done).length;
    if (pts.length >= 3 && done / pts.length >= 0.7) out.push({ icon: "flame", tone: "ac", text: `${p.name} avance vite (${Math.round(done / pts.length * 100)}%)`, action: { view: "projects" } });
  });

  const props = data.contacts.filter((c) => c.stage === "Proposition");
  if (props.length) out.push({ icon: "user-up", tone: "ac", text: `${props.length} contact${props.length > 1 ? "s" : ""} en phase Proposition à relancer`, action: { view: "crm" } });

  return out.slice(0, 8);
}

/* ----------------------- Intelligence : statistiques -------------------- */
export function computeStats(data, { days = 30, projectId = null } = {}) {
  const tasks = projectId ? data.tasks.filter((t) => t.projectId === projectId) : data.tasks;
  const today = todayISO();
  const start = dPlus(-days + 1);

  const completed = tasks.filter((t) => t.done && t.doneAt);
  const created = tasks.filter((t) => t.createdAt);

  const inRange = (ts) => iso(new Date(ts)) >= start;
  const completedIn = completed.filter((t) => inRange(t.doneAt));
  const createdIn = created.filter((t) => inRange(t.createdAt));

  const completionRate = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
  const velocityPerWeek = Math.round((completedIn.length / days) * 7);
  const lateCount = tasks.filter((t) => !t.done && t.date && t.date < today).length;

  let avgLeadDays = 0;
  if (completedIn.length) {
    const sum = completedIn.reduce((s, t) => s + Math.max(0, (t.doneAt - (t.createdAt || t.doneAt)) / 86400000), 0);
    avgLeadDays = +(sum / completedIn.length).toFixed(1);
  }

  const byPriority = { 1: 0, 2: 0, 3: 0, 4: 0 };
  tasks.forEach((t) => { byPriority[t.priority || 3] = (byPriority[t.priority || 3] || 0) + 1; });

  const byProject = data.projects.map((p) => {
    const pts = data.tasks.filter((t) => t.projectId === p.id);
    const done = pts.filter((t) => t.done).length;
    return { id: p.id, name: p.name, color: p.color, total: pts.length, done, pct: pts.length ? Math.round(done / pts.length * 100) : 0 };
  }).filter((x) => x.total > 0).sort((a, b) => b.pct - a.pct);

  /* Série jour par jour (créées vs terminées) */
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dPlus(-i);
    series.push({
      day,
      created: createdIn.filter((t) => iso(new Date(t.createdAt)) === day).length,
      done: completedIn.filter((t) => iso(new Date(t.doneAt)) === day).length,
    });
  }

  /* Heatmap : activité par jour sur 'heatDays' */
  const heatDays = 100;
  const counts = {};
  (data.activity || []).forEach((a) => { const k = iso(new Date(a.ts)); counts[k] = (counts[k] || 0) + 1; });
  completed.forEach((t) => { const k = iso(new Date(t.doneAt)); counts[k] = (counts[k] || 0) + 1; });
  const heatmap = [];
  for (let i = heatDays - 1; i >= 0; i--) { const day = dPlus(-i); heatmap.push({ day, count: counts[day] || 0 }); }
  const heatMax = Math.max(1, ...heatmap.map((h) => h.count));

  return { completionRate, velocityPerWeek, lateCount, avgLeadDays, byPriority, byProject, series, heatmap, heatMax, totalTasks: tasks.length, doneTasks: tasks.filter((t) => t.done).length };
}

/* ----------------------- Recherche universelle (⌘K) --------------------- */
export function universalSearch(data, q) {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const hit = (s) => s && s.toLowerCase().includes(query);
  const res = [];
  data.tasks.forEach((t) => { if (hit(t.title) || hit(t.notes) || (t.tags || []).some(hit)) res.push({ kind: "task", id: t.id, title: t.title, sub: t.done ? "Tâche · terminée" : "Tâche", icon: "circle-check", view: "tasks" }); });
  data.projects.forEach((p) => { if (hit(p.name) || hit(p.desc)) res.push({ kind: "project", id: p.id, title: p.name, sub: "Projet", icon: "folder", view: "projects" }); });
  data.notes.forEach((n) => { if (hit(n.title) || hit(n.body)) res.push({ kind: "note", id: n.id, title: n.title, sub: "Note · Personal Brain", icon: "bulb", view: "brain" }); });
  data.contacts.forEach((c) => { if (hit(c.name) || hit(c.company)) res.push({ kind: "contact", id: c.id, title: c.name, sub: c.company || "Contact", icon: "user", view: "crm" }); });
  data.events.forEach((e) => { if (hit(e.title) || hit(e.location)) res.push({ kind: "event", id: e.id, title: e.title, sub: `Événement · ${fmtNice(e.date)}`, icon: "calendar", view: "agenda" }); });
  /* fichiers de toutes les dropbox + tâches + mémoire générale du Brain */
  const files = [];
  data.projects.forEach((p) => (p.files || []).forEach((f) => files.push({ f, where: p.name })));
  data.tasks.forEach((t) => (t.files || []).forEach((f) => files.push({ f, where: t.title })));
  (data.brainFiles || []).forEach((f) => files.push({ f, where: "Mémoire générale" }));
  files.forEach(({ f, where }) => { if (hit(f.name)) res.push({ kind: "file", id: f.id, title: f.name, sub: `Fichier · ${where}`, icon: "file", view: "brain", content: f.content }); });
  return res.slice(0, 30);
}
