import React, { useState, useRef } from "react";
import {
  Plus, Search, Clock, Paperclip, GripVertical, Trash2, CheckSquare, X, Check, Link2, ExternalLink,
} from "lucide-react";
import { uid, todayISO, PRIOS, STATUS, fmtNice, daysBetween } from "../lib/core.js";
import { pushAct } from "../lib/core.js";
import { Sheet, DropZone, FileChip, PrioPill, StatusPill, Empty } from "../components.jsx";

function TaskEditor({ task, projects, patch, addFiles, rmFile, activity }) {
  const [tag, setTag] = useState("");
  const [sub, setSub] = useState("");
  const [linkL, setLinkL] = useState(""); const [linkU, setLinkU] = useState("");
  const set = (k, v) => patch({ [k]: v });

  const addTag = () => { const t = tag.trim(); if (t && !(task.tags || []).includes(t)) patch({ tags: [...(task.tags || []), t] }); setTag(""); };
  const addSub = () => { const t = sub.trim(); if (t) patch({ subtasks: [...(task.subtasks || []), { id: uid(), title: t, done: false }] }); setSub(""); };
  const toggleSub = (id) => patch({ subtasks: task.subtasks.map((s) => s.id === id ? { ...s, done: !s.done } : s) });
  const rmSub = (id) => patch({ subtasks: task.subtasks.filter((s) => s.id !== id) });
  const addLink = () => { if (!linkU.trim()) return; patch({ links: [...(task.links || []), { id: uid(), label: linkL.trim() || linkU.trim(), url: linkU.trim() }] }); setLinkL(""); setLinkU(""); };
  const rmLink = (id) => patch({ links: task.links.filter((l) => l.id !== id) });

  const subDone = (task.subtasks || []).filter((s) => s.done).length;

  return (
    <div>
      <div className="field"><label>Titre</label>
        <textarea rows={2} value={task.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div className="row2">
        <div className="field"><label>Statut</label>
          <select value={task.status || "todo"} onChange={(e) => set("status", e.target.value)}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="field"><label>Priorité</label>
          <select value={task.priority} onChange={(e) => set("priority", Number(e.target.value))}>
            {Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field"><label>Date</label><input type="date" value={task.date || ""} onChange={(e) => set("date", e.target.value)} /></div>
        <div className="field"><label>Heure</label><input type="time" value={task.time || ""} onChange={(e) => set("time", e.target.value)} /></div>
      </div>
      <div className="field"><label>Projet</label>
        <select value={task.projectId || ""} onChange={(e) => set("projectId", e.target.value || null)}>
          <option value="">Sans projet</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Tags</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 7 }}>
          {(task.tags || []).map((t) => (
            <span key={t} className="tag" style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>{t}
              <X size={11} style={{ cursor: "pointer" }} onClick={() => patch({ tags: task.tags.filter((x) => x !== t) })} /></span>
          ))}
        </div>
        <input placeholder="Ajouter un tag, Entrée…" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
      </div>
      <div className="field">
        <label>Sous-tâches {(task.subtasks || []).length > 0 && <span className="mono" style={{ color: "var(--t3)" }}>{subDone}/{task.subtasks.length}</span>}</label>
        {(task.subtasks || []).map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0" }}>
            <button className={"check" + (s.done ? " on" : "")} style={{ width: 17, height: 17 }} onClick={() => toggleSub(s.id)}><Check size={11} strokeWidth={3} /></button>
            <span style={{ flex: 1, fontSize: 12.5, textDecoration: s.done ? "line-through" : "none", color: s.done ? "var(--t3)" : "var(--tx)" }}>{s.title}</span>
            <button className="icon-btn red" style={{ width: 24, height: 24 }} onClick={() => rmSub(s.id)}><X size={12} /></button>
          </div>
        ))}
        <input placeholder="Ajouter une sous-tâche, Entrée…" value={sub} onChange={(e) => setSub(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSub())} style={{ marginTop: 6 }} />
      </div>
      <div className="field"><label>Notes</label>
        <textarea rows={3} value={task.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Détails, contexte…" />
      </div>
      <div className="field"><label>Liens</label>
        {(task.links || []).map((l) => (
          <div key={l.id} className="file-chip"><Link2 size={13} style={{ color: "var(--acT)", flex: "none" }} />
            <a className="name" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
            <a href={l.url} target="_blank" rel="noreferrer" className="icon-btn" style={{ width: 24, height: 24 }}><ExternalLink size={12} /></a>
            <button className="icon-btn red" style={{ width: 24, height: 24 }} onClick={() => rmLink(l.id)}><X size={12} /></button>
          </div>
        ))}
        <div className="row2" style={{ marginTop: 4 }}>
          <input placeholder="Libellé" value={linkL} onChange={(e) => setLinkL(e.target.value)} />
          <input placeholder="https://…" value={linkU} onChange={(e) => setLinkU(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} />
        </div>
      </div>
      <div className="field"><label>Fichiers</label>
        {(task.files || []).map((f) => <FileChip key={f.id} f={f} onRemove={() => rmFile(f.id)} />)}
        <DropZone compact onFiles={addFiles} label="Déposer un fichier sur la tâche" />
      </div>
      <div className="field" style={{ marginBottom: 0 }}><label>Historique</label>
        <div className="hint mono" style={{ fontSize: 11 }}>
          créée {fmtNice(new Date(task.createdAt).toISOString().slice(0, 10))}
          {activity.length > 0 && ` · ${activity.length} action${activity.length > 1 ? "s" : ""} tracée${activity.length > 1 ? "s" : ""}`}
          {task.doneAt && ` · terminée le ${fmtNice(new Date(task.doneAt).toISOString().slice(0, 10))}`}
        </div>
      </div>
    </div>
  );
}

export default function Tasks({ data, update, pushToast }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [prio, setPrio] = useState(3);
  const [proj, setProj] = useState("");
  const [filter, setFilter] = useState("active");
  const [sortMode, setSortMode] = useState("manual");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const dragId = useRef(null);
  const snap = useRef(null);

  const add = () => {
    if (!title.trim()) return;
    const t = { id: uid(), title: title.trim(), notes: "", date, time, durationMin: 0, priority: prio, status: "todo", projectId: proj || null, tags: [], subtasks: [], links: [], done: false, files: [], createdAt: Date.now(), updatedAt: Date.now() };
    update((d) => { d.tasks.unshift(t); pushAct(d, "task.create", `Tâche « ${t.title} » créée`, { entity: "task", entityId: t.id, projectId: t.projectId }); return d; });
    setTitle(""); setTime("");
    pushToast("Tâche ajoutée", "green");
  };

  const toggle = (id) => update((d) => {
    const t = d.tasks.find((x) => x.id === id); if (!t) return d;
    t.done = !t.done; t.doneAt = t.done ? Date.now() : null; t.status = t.done ? "done" : "todo"; t.updatedAt = Date.now();
    pushAct(d, t.done ? "task.done" : "task.reopen", `Tâche « ${t.title} » ${t.done ? "terminée" : "rouverte"}`, { entity: "task", entityId: id, projectId: t.projectId });
    return d;
  });
  const remove = (id) => {
    update((d) => { const t = d.tasks.find((x) => x.id === id); d.tasks = d.tasks.filter((x) => x.id !== id); if (t) pushAct(d, "task.delete", `Tâche « ${t.title} » supprimée`, { entity: "task", entityId: id }); return d; });
    setOpenId(null); pushToast("Tâche supprimée", "red");
  };
  const cyclePrio = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.priority = t.priority >= 4 ? 1 : t.priority + 1; t.updatedAt = Date.now(); } return d; });
  const patch = (id, partial) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { Object.assign(t, partial); if (partial.status) t.done = partial.status === "done", t.doneAt = t.done ? (t.doneAt || Date.now()) : null; t.updatedAt = Date.now(); } return d; });
  const addFiles = (id, fs) => { update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.files = [...(t.files || []), ...fs]; pushAct(d, "file.add", `${fs.length} fichier(s) ajouté(s) à « ${t.title} »`, { entity: "task", entityId: id, projectId: t.projectId }); } return d; }); pushToast(`${fs.length} fichier(s) joint(s)`, "green"); };
  const rmFile = (id, fid) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) t.files = t.files.filter((f) => f.id !== fid); return d; });

  const openSheet = (t) => { snap.current = JSON.stringify(t); setOpenId(t.id); };
  const closeSheet = () => {
    const t = data.tasks.find((x) => x.id === openId);
    if (t && snap.current && snap.current !== JSON.stringify(t)) {
      update((d) => { pushAct(d, "task.edit", `Tâche « ${t.title} » modifiée`, { entity: "task", entityId: t.id, projectId: t.projectId }); return d; });
    }
    setOpenId(null);
  };

  const onDrop = (targetId) => {
    const src = dragId.current; if (!src || src === targetId) return;
    update((d) => { const from = d.tasks.findIndex((t) => t.id === src), to = d.tasks.findIndex((t) => t.id === targetId); if (from < 0 || to < 0) return d; const [mv] = d.tasks.splice(from, 1); d.tasks.splice(to, 0, mv); return d; });
  };

  const today = todayISO();
  let list = data.tasks.filter((t) => {
    if (q && !(t.title.toLowerCase().includes(q.toLowerCase()) || (t.tags || []).some((x) => x.toLowerCase().includes(q.toLowerCase())))) return false;
    if (filter === "active") return !t.done;
    if (filter === "today") return !t.done && t.date === today;
    if (filter === "late") return !t.done && t.date && t.date < today;
    if (filter === "done") return t.done;
    return true;
  });
  if (sortMode === "priority") list = [...list].sort((a, b) => a.priority - b.priority);
  if (sortMode === "date") list = [...list].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const projName = (id) => (data.projects.find((p) => p.id === id) || {}).name;
  const openTask = data.tasks.find((t) => t.id === openId);
  const taskActivity = openTask ? (data.activity || []).filter((a) => a.entityId === openTask.id) : [];

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ flex: "2 1 220px" }} placeholder="Nouvelle tâche…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <input type="date" style={{ width: 148 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" style={{ width: 110 }} value={time} onChange={(e) => setTime(e.target.value)} />
          <select style={{ width: 128 }} value={prio} onChange={(e) => setPrio(Number(e.target.value))}>{Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select style={{ width: 150 }} value={proj} onChange={(e) => setProj(e.target.value)}><option value="">Sans projet</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <button className="btn" onClick={add}><Plus size={14} /> Ajouter</button>
        </div>
      </div>

      <div className="section-head">
        <div className="tabs">
          {[["active", "À faire"], ["today", "Aujourd'hui"], ["late", "En retard"], ["done", "Terminées"], ["all", "Toutes"]].map(([k, l]) => (
            <button key={k} className={"tab" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--t3)" }} />
            <input style={{ width: 180, paddingLeft: 30 }} placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select style={{ width: 158 }} value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="manual">Ordre manuel</option><option value="priority">Par priorité</option><option value="date">Par date</option>
          </select>
        </div>
      </div>

      {list.length === 0 && <div className="card"><Empty icon={CheckSquare}>Aucune tâche ici. Ajoute-en une ci-dessus.</Empty></div>}

      {list.map((t) => (
        <div key={t.id} className={"task-row" + (t.done ? " done" : "") + (openId === t.id ? " sel" : "")}
          draggable={sortMode === "manual"}
          onDragStart={() => { dragId.current = t.id; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onDrop(t.id); }}
          onClick={() => openSheet(t)}>
          {sortMode === "manual" && <span className="grip" onClick={(e) => e.stopPropagation()}><GripVertical size={14} /></span>}
          <button className={"check" + (t.done ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggle(t.id); }}><Check size={12} strokeWidth={3} /></button>
          <span className="task-title">{t.title}</span>
          {(t.subtasks || []).length > 0 && <span className="task-meta"><CheckSquare size={12} />{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span>}
          {t.projectId && projName(t.projectId) && <span className="tag">{projName(t.projectId)}</span>}
          {(t.files || []).length > 0 && <span className="task-meta"><Paperclip size={12} />{t.files.length}</span>}
          {t.date && <span className="task-meta" style={!t.done && t.date < today ? { color: "var(--rd)" } : null}><Clock size={12} />{fmtNice(t.date)}{t.time ? " " + t.time : ""}</span>}
          <span onClick={(e) => { e.stopPropagation(); cyclePrio(t.id); }}><PrioPill p={t.priority} /></span>
        </div>
      ))}

      {openTask && (
        <Sheet title="Modifier la tâche" sub="Tout est éditable — enregistré automatiquement" onClose={closeSheet}
          footer={<>
            <button className="btn btn-red btn-sm" onClick={() => remove(openTask.id)}><Trash2 size={13} /> Supprimer</button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeSheet}><Check size={14} /> Fermer</button>
          </>}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button className={"check" + (openTask.done ? " on" : "")} onClick={() => toggle(openTask.id)}><Check size={12} strokeWidth={3} /></button>
            <StatusPill s={openTask.status || (openTask.done ? "done" : "todo")} />
          </div>
          <TaskEditor task={openTask} projects={data.projects} activity={taskActivity}
            patch={(p) => patch(openTask.id, p)} addFiles={(fs) => addFiles(openTask.id, fs)} rmFile={(fid) => rmFile(openTask.id, fid)} />
        </Sheet>
      )}
    </div>
  );
}
