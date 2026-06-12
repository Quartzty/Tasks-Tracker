import React, { useState, useMemo } from "react";
import {
  Plus, Search, Sparkles, AlertTriangle, Flame, Layers, UserPlus, Moon,
  Lightbulb, Pin, Trash2, Check, FileText, Folder, Brain as BrainIcon, Download,
  CirclePlus, Pencil, CircleCheck, RotateCcw, ArrowRight, Paperclip, X as XIcon,
  CalendarPlus, FolderPlus,
} from "lucide-react";
import { uid, fmtSize, computeInsights, pushAct } from "../lib/core.js";
import { Modal, linkify } from "../components.jsx";
import { Timeline } from "../components/ui/timeline.jsx";
import FileUpload from "../components/ui/file-upload.jsx";
import { cn } from "../lib/cn.js";

const INSIGHT_ICON = { "alert-triangle": AlertTriangle, "flame": Flame, "stack-2": Layers, "user-up": UserPlus, "zzz": Moon, "sparkles": Sparkles };

/* Icônes + statuts par type d'événement pour la Timeline 21st.dev */
const ACT_META = {
  "task.create": { icon: CirclePlus, status: "default" },
  "task.edit": { icon: Pencil, status: "default" },
  "task.done": { icon: Check, status: "completed" },
  "task.reopen": { icon: RotateCcw, status: "active" },
  "task.delete": { icon: Trash2, status: "error" },
  "event.create": { icon: CalendarPlus, status: "default" },
  "event.edit": { icon: Pencil, status: "default" },
  "event.delete": { icon: Trash2, status: "error" },
  "project.create": { icon: FolderPlus, status: "completed" },
  "project.edit": { icon: Pencil, status: "default" },
  "project.delete": { icon: Trash2, status: "error" },
  "file.add": { icon: Paperclip, status: "completed" },
  "file.remove": { icon: XIcon, status: "error" },
  "contact.create": { icon: UserPlus, status: "default" },
  "contact.edit": { icon: Pencil, status: "default" },
  "contact.move": { icon: ArrowRight, status: "active" },
  "contact.delete": { icon: Trash2, status: "error" },
  "note.create": { icon: Lightbulb, status: "completed" },
  "note.edit": { icon: Pencil, status: "default" },
  "note.delete": { icon: Trash2, status: "error" },
};

function NoteModal({ note, projects, onSave, onDelete, onClose }) {
  const [f, setF] = useState(note);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal title={note.id ? "Note" : "Nouvelle note"} onClose={onClose}>
      <div className="field"><label>Titre</label><input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Thèse Watchpoint" autoFocus /></div>
      <div className="field"><label>Contenu</label><textarea rows={5} value={f.body} onChange={(e) => set("body", e.target.value)} placeholder="Écris ta mémoire… Lie une tâche/projet avec [[Nom]]." /></div>
      <div className="field"><label>Projet lié</label>
        <select value={f.projectId || ""} onChange={(e) => set("projectId", e.target.value || null)}><option value="">Aucun</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button className={"check" + (f.pinned ? " on" : "")} onClick={() => set("pinned", !f.pinned)}><Check size={12} strokeWidth={3} /></button>
        <span style={{ fontSize: 14 }}>Épingler en haut</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {onDelete && <button className="btn btn-red" onClick={onDelete}><Trash2 size={14} /> Supprimer</button>}
        <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} disabled={!f.title.trim()} onClick={() => onSave(f)}><Check size={14} /> Enregistrer</button>
      </div>
    </Modal>
  );
}

export default function Brain({ data, update, pushToast, goTo }) {
  const [fProj, setFProj] = useState("all");
  const [noteModal, setNoteModal] = useState(null);
  const [fileQ, setFileQ] = useState("");

  const projName = (id) => (data.projects.find((p) => p.id === id) || {}).name;
  const insights = useMemo(() => computeInsights(data), [data]);

  /* -------- Flux d'activité (Timeline 21st.dev) -------- */
  const activityItems = useMemo(() => {
    let a = data.activity || [];
    if (fProj !== "all") a = a.filter((x) => x.projectId === fProj || x.entityId === fProj);
    return a.slice(0, 60).map((x) => {
      const meta = ACT_META[x.type] || { icon: Pencil, status: "default" };
      const Ic = meta.icon;
      return { id: x.id, title: x.summary, timestamp: x.ts, status: meta.status, icon: <Ic className="h-3.5 w-3.5" />, tag: x.projectId ? projName(x.projectId) : undefined };
    });
  }, [data.activity, fProj, data.projects]);

  /* -------- Notes (mémoire écrite) -------- */
  const notes = useMemo(() => {
    let n = [...(data.notes || [])];
    if (fProj !== "all") n = n.filter((x) => x.projectId === fProj);
    return n.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt);
  }, [data.notes, fProj]);

  /* -------- Mémoire de fichiers : drag & drop rangé par projet -------- */
  const targetProject = fProj !== "all" ? data.projects.find((p) => p.id === fProj) : null;
  const targetLabel = targetProject ? targetProject.name : "Mémoire générale";

  const addFiles = (fs) => {
    update((d) => {
      if (targetProject) {
        const p = d.projects.find((x) => x.id === targetProject.id);
        if (p) { p.files = [...(p.files || []), ...fs]; p.updatedAt = Date.now(); }
        pushAct(d, "file.add", `${fs.length} fichier(s) mémorisé(s) dans « ${targetProject.name} »`, { entity: "project", entityId: targetProject.id, projectId: targetProject.id });
      } else {
        d.brainFiles = [...(d.brainFiles || []), ...fs];
        pushAct(d, "file.add", `${fs.length} fichier(s) mémorisé(s) (mémoire générale)`, { entity: "brain", entityId: "brain" });
      }
      return d;
    });
    pushToast(`${fs.length} fichier(s) ajouté(s) à la mémoire — ${targetLabel}`, "green");
  };

  const removeFile = (f) => {
    update((d) => {
      if (f.source === "brain") d.brainFiles = (d.brainFiles || []).filter((x) => x.id !== f.id);
      else if (f.source === "project") { const p = d.projects.find((x) => x.id === f.sourceId); if (p) p.files = (p.files || []).filter((x) => x.id !== f.id); }
      else if (f.source === "task") { const t = d.tasks.find((x) => x.id === f.sourceId); if (t) t.files = (t.files || []).filter((x) => x.id !== f.id); }
      pushAct(d, "file.remove", `Fichier « ${f.name} » retiré de la mémoire`, { entity: f.source, entityId: f.sourceId, projectId: f.source === "project" ? f.sourceId : undefined });
      return d;
    });
    pushToast("Fichier retiré de la mémoire", "red");
  };

  /* Index complet : projets + tâches + mémoire générale, groupé par projet */
  const fileGroups = useMemo(() => {
    const q = fileQ.trim().toLowerCase();
    const match = (f) => !q || f.name.toLowerCase().includes(q);
    const groups = [];
    data.projects.forEach((p) => {
      if (fProj !== "all" && fProj !== p.id) return;
      const own = (p.files || []).filter(match).map((f) => ({ ...f, source: "project", sourceId: p.id }));
      const fromTasks = data.tasks.filter((t) => t.projectId === p.id)
        .flatMap((t) => (t.files || []).filter(match).map((f) => ({ ...f, source: "task", sourceId: t.id, where: t.title })));
      const files = [...own, ...fromTasks];
      if (files.length) groups.push({ id: p.id, name: p.name, files });
    });
    if (fProj === "all") {
      const general = [
        ...(data.brainFiles || []).filter(match).map((f) => ({ ...f, source: "brain" })),
        ...data.tasks.filter((t) => !t.projectId).flatMap((t) => (t.files || []).filter(match).map((f) => ({ ...f, source: "task", sourceId: t.id, where: t.title }))),
      ];
      if (general.length) groups.push({ id: "general", name: "Mémoire générale", files: general });
    } else if (fProj !== "all" && !targetProject) {
      /* rien */
    }
    return groups;
  }, [data.projects, data.tasks, data.brainFiles, fileQ, fProj]);

  const memorizedHere = targetProject
    ? (targetProject.files || []).map((f) => ({ ...f, source: "project", sourceId: targetProject.id }))
    : (data.brainFiles || []).map((f) => ({ ...f, source: "brain" }));

  /* -------- Notes CRUD -------- */
  const saveNote = (n) => {
    update((d) => {
      if (n.id) { const i = d.notes.findIndex((x) => x.id === n.id); if (i >= 0) d.notes[i] = { ...n, updatedAt: Date.now() }; pushAct(d, "note.edit", `Note « ${n.title} » modifiée`, { entity: "note", entityId: n.id, projectId: n.projectId }); }
      else { const nn = { ...n, id: uid(), taskIds: [], createdAt: Date.now(), updatedAt: Date.now() }; d.notes.unshift(nn); pushAct(d, "note.create", `Note « ${nn.title} » ajoutée`, { entity: "note", entityId: nn.id, projectId: nn.projectId }); }
      return d;
    });
    setNoteModal(null); pushToast("Note enregistrée", "green");
  };
  const delNote = (id) => { update((d) => { const n = d.notes.find((x) => x.id === id); d.notes = d.notes.filter((x) => x.id !== id); if (n) pushAct(d, "note.delete", `Note « ${n.title} » supprimée`, { entity: "note", entityId: id }); return d; }); setNoteModal(null); pushToast("Note supprimée", "red"); };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Personal Brain</h2>
          <div className="hint" style={{ marginTop: 5 }}>Mémoire persistante — notes, fichiers et activité, rangés par projet et traçables.</div>
        </div>
        <div className="tabs">
          <button className={"tab" + (fProj === "all" ? " on" : "")} onClick={() => setFProj("all")}>Tous</button>
          {data.projects.map((p) => <button key={p.id} className={"tab" + (fProj === p.id ? " on" : "")} onClick={() => setFProj(p.id)}>{p.name}</button>)}
        </div>
      </div>

      <div className="bento">
        {/* Mémoire de fichiers : drag & drop 21st.dev */}
        <div className="card span7">
          <div className="card-title">Mémoire de fichiers — {targetLabel}
            <span className="mono" style={{ color: "var(--t3)", textTransform: "none", letterSpacing: 0 }}>{memorizedHere.length} fichier{memorizedHere.length > 1 ? "s" : ""}</span>
          </div>
          <FileUpload
            files={memorizedHere}
            onAdd={addFiles}
            onRemove={removeFile}
            targetLabel={targetLabel}
            hint={fProj === "all" ? "Astuce : sélectionne un projet ci-dessus pour ranger directement dedans." : undefined}
          />
        </div>

        <div className="span5" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Notes */}
          <div className="card">
            <div className="card-title">Notes <button className="icon-btn" onClick={() => setNoteModal({ title: "", body: "", projectId: fProj === "all" ? null : fProj, pinned: false })}><Plus size={16} /></button></div>
            {notes.length === 0 && <div className="hint" style={{ padding: "8px 0 4px" }}>Aucune note{fProj !== "all" ? " pour ce projet" : ""}. Capture une idée, une décision, un contexte.</div>}
            {notes.map((n) => (
              <div key={n.id} className="note" onClick={() => setNoteModal(n)}>
                <div className="nt">{n.pinned && <Pin size={13} style={{ color: "var(--acT)" }} />}{n.title}{n.projectId && projName(n.projectId) && <span className="tag" style={{ marginLeft: "auto" }}>{projName(n.projectId)}</span>}</div>
                {n.body && <div className="nb">{linkify(n.body)}</div>}
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="card">
            <div className="card-title">Insights</div>
            {insights.length === 0 && <div className="hint">Tout est sous contrôle — aucun signal à remonter.</div>}
            {insights.map((ins, i) => {
              const Ic = INSIGHT_ICON[ins.icon] || Sparkles;
              return <div key={i} className="chip" style={{ display: "flex", marginBottom: 8, color: ins.tone === "rd" ? "var(--rd)" : "var(--t2)" }} onClick={() => ins.action && goTo(ins.action.view)}><Ic size={15} /> {ins.text}</div>;
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--t3)", background: "var(--surface2)", border: "1px dashed var(--bd2)", borderRadius: 10, padding: "10px 13px", marginTop: 6 }}>
              <Sparkles size={15} /> Résumer / suggérer avec l'IA
              <span className="mono" style={{ marginLeft: "auto", fontSize: 11, background: "var(--surface3)", borderRadius: 5, padding: "2px 7px" }}>bientôt</span>
            </div>
          </div>
        </div>

        {/* Flux d'activité (Timeline 21st.dev) */}
        <div className="card span7">
          <div className="card-title">Flux d'activité <span className="mono" style={{ color: "var(--t3)" }}>{activityItems.length}</span></div>
          {activityItems.length === 0
            ? <div className="empty"><BrainIcon size={22} />Aucune activité{fProj !== "all" ? " sur ce projet" : ""} pour l'instant.</div>
            : <Timeline items={activityItems} variant="default" />}
        </div>

        {/* Index global cherchable, groupé par projet */}
        <div className="card span5">
          <div className="card-title">Index — toute la mémoire
            <span style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--t3)" }} />
              <input style={{ width: 190, paddingLeft: 32, textTransform: "none", letterSpacing: 0, fontWeight: 400 }} placeholder="Chercher…" value={fileQ} onChange={(e) => setFileQ(e.target.value)} />
            </span>
          </div>
          {fileGroups.length === 0 && <div className="hint">Aucun fichier {fileQ ? "ne correspond." : "mémorisé pour l'instant — dépose ton premier fichier à gauche."}</div>}
          {fileGroups.map((g) => (
            <div key={g.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, fontSize: 12.5, fontWeight: 700, color: "var(--t2)" }}>
                <Folder size={13} /> {g.name} <span className="mono" style={{ color: "var(--t3)", fontWeight: 500 }}>{g.files.length}</span>
              </div>
              {g.files.map((f) => (
                <div key={f.source + f.id} className="file-chip">
                  <FileText size={15} style={{ color: "var(--t2)", flex: "none" }} />
                  <span className="name" title={f.name}>{f.name}</span>
                  <span className="size">{fmtSize(f.size)}{f.where ? ` · ${f.where}` : ""}</span>
                  {f.content && <a href={f.content} download={f.name} className="icon-btn" style={{ width: 28, height: 28 }} title="Télécharger"><Download size={14} /></a>}
                  {f.source !== "task" && <button className="icon-btn red" style={{ width: 28, height: 28 }} onClick={() => removeFile(f)} title="Retirer"><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {noteModal && <NoteModal note={noteModal} projects={data.projects} onSave={saveNote} onDelete={noteModal.id ? () => delNote(noteModal.id) : null} onClose={() => setNoteModal(null)} />}
    </div>
  );
}
