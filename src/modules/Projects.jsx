import React, { useState } from "react";
import { Plus, FolderKanban, Trash2, Check, Pencil, Link2, ExternalLink, X } from "lucide-react";
import { uid, PALETTE, PROJ_STATUS, fmtNice, pushAct } from "../lib/core.js";
import { Sheet, DropZone, FileChip, Empty } from "../components.jsx";

function ProjectEditor({ p, patch, addFiles, rmFile, addLink, rmLink }) {
  const [linkL, setLinkL] = useState(""); const [linkU, setLinkU] = useState("");
  const set = (k, v) => patch({ [k]: v });
  const submitLink = () => { if (!linkU.trim()) return; addLink({ id: uid(), label: linkL.trim() || linkU.trim(), url: linkU.trim() }); setLinkL(""); setLinkU(""); };
  return (
    <div>
      <div className="field"><label>Nom</label><input value={p.name} onChange={(e) => set("name", e.target.value)} autoFocus /></div>
      <div className="field"><label>Description</label><textarea rows={2} value={p.desc || ""} onChange={(e) => set("desc", e.target.value)} /></div>
      <div className="row2">
        <div className="field"><label>Statut</label>
          <select value={p.status || "active"} onChange={(e) => set("status", e.target.value)}>{Object.entries(PROJ_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        </div>
        <div className="field"><label>Échéance</label><input type="date" value={p.dueDate || ""} onChange={(e) => set("dueDate", e.target.value)} /></div>
      </div>
      <div className="field"><label>Couleur</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PALETTE.map((c) => <button key={c} onClick={() => set("color", c)} style={{ width: 26, height: 26, borderRadius: 8, background: c, border: p.color === c ? "2px solid var(--tx)" : "2px solid transparent" }} />)}
        </div>
      </div>
      <div className="field"><label>Notes du projet</label><textarea rows={3} value={p.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Contexte, décisions…" /></div>
      <div className="field"><label>Liens (Drive, Figma…)</label>
        {(p.links || []).map((l) => (
          <div key={l.id} className="file-chip"><Link2 size={13} style={{ color: "var(--acT)", flex: "none" }} /><a className="name" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
            <a href={l.url} target="_blank" rel="noreferrer" className="icon-btn" style={{ width: 24, height: 24 }}><ExternalLink size={12} /></a>
            <button className="icon-btn red" style={{ width: 24, height: 24 }} onClick={() => rmLink(l.id)}><X size={12} /></button></div>
        ))}
        <div className="row2" style={{ marginTop: 4 }}>
          <input placeholder="Libellé" value={linkL} onChange={(e) => setLinkL(e.target.value)} />
          <input placeholder="https://…" value={linkU} onChange={(e) => setLinkU(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitLink()} />
        </div>
      </div>
      <div className="field" style={{ marginBottom: 0 }}><label>Dropbox du projet</label>
        {(p.files || []).map((f) => <FileChip key={f.id} f={f} onRemove={() => rmFile(f.id)} />)}
        <DropZone compact onFiles={addFiles} label="Déposer un fichier dans la dropbox" />
      </div>
    </div>
  );
}

export default function Projects({ data, update, pushToast }) {
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);

  const create = () => {
    const p = { id: uid(), name: "Nouveau projet", color: PALETTE[0], desc: "", status: "active", dueDate: "", files: [], links: [], notes: "", createdAt: Date.now(), updatedAt: Date.now() };
    update((d) => { d.projects.push(p); pushAct(d, "project.create", `Projet « ${p.name} » créé`, { entity: "project", entityId: p.id }); return d; });
    setOpenId(p.id); setCreating(true);
  };
  const patch = (id, partial) => update((d) => { const p = d.projects.find((x) => x.id === id); if (p) { Object.assign(p, partial); p.updatedAt = Date.now(); } return d; });
  const remove = (id) => { update((d) => { const p = d.projects.find((x) => x.id === id); d.projects = d.projects.filter((x) => x.id !== id); d.tasks.forEach((t) => { if (t.projectId === id) t.projectId = null; }); if (p) pushAct(d, "project.delete", `Projet « ${p.name} » supprimé`, { entity: "project", entityId: id }); return d; }); setOpenId(null); pushToast("Projet supprimé", "red"); };
  const addFiles = (id, fs) => { update((d) => { const p = d.projects.find((x) => x.id === id); if (p) { p.files = [...(p.files || []), ...fs]; pushAct(d, "file.add", `${fs.length} fichier(s) ajouté(s) à « ${p.name} »`, { entity: "project", entityId: id, projectId: id }); } return d; }); pushToast(`${fs.length} fichier(s) ajouté(s)`, "green"); };
  const rmFile = (id, fid) => update((d) => { const p = d.projects.find((x) => x.id === id); if (p) p.files = p.files.filter((f) => f.id !== fid); return d; });
  const addLink = (id, l) => update((d) => { const p = d.projects.find((x) => x.id === id); if (p) p.links = [...(p.links || []), l]; return d; });
  const rmLink = (id, lid) => update((d) => { const p = d.projects.find((x) => x.id === id); if (p) p.links = p.links.filter((l) => l.id !== lid); return d; });
  const toggle = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; t.status = t.done ? "done" : "todo"; } return d; });

  const closeSheet = () => { const p = data.projects.find((x) => x.id === openId); if (p && !creating) update((d) => { pushAct(d, "project.edit", `Projet « ${p.name} » modifié`, { entity: "project", entityId: p.id, projectId: p.id }); return d; }); setOpenId(null); setCreating(false); };
  const open = data.projects.find((p) => p.id === openId);

  return (
    <div>
      <div className="section-head"><h2>Projets</h2><button className="btn" onClick={create}><Plus size={14} /> Nouveau projet</button></div>
      {data.projects.length === 0 && <div className="card"><Empty icon={FolderKanban}>Crée ton premier projet pour organiser tâches et fichiers.</Empty></div>}
      <div className="proj-grid">
        {data.projects.map((p) => {
          const pts = data.tasks.filter((t) => t.projectId === p.id);
          const done = pts.filter((t) => t.done).length;
          const pct = pts.length ? Math.round((done / pts.length) * 100) : 0;
          const st = PROJ_STATUS[p.status || "active"];
          return (
            <div key={p.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <span className="prio-dot" style={{ background: p.color, width: 10, height: 10 }} />
                <span style={{ fontWeight: 800, fontSize: 14.5, flex: 1, cursor: "pointer" }} onClick={() => setOpenId(p.id)}>{p.name}</span>
                <span className="statpill" style={{ background: "color-mix(in srgb," + st.color + " 16%,transparent)", color: st.color }}>{st.label}</span>
                <button className="icon-btn" onClick={() => setOpenId(p.id)} title="Modifier"><Pencil size={14} /></button>
                <button className="icon-btn red" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
              </div>
              {p.desc && <div className="hint" style={{ marginBottom: 10 }}>{p.desc}</div>}
              {p.dueDate && <div className="hint" style={{ marginBottom: 6 }}>Échéance : {fmtNice(p.dueDate)}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "8px 0 14px" }}>
                <div className="progress" style={{ flex: 1 }}><i style={{ width: pct + "%", background: p.color }} /></div>
                <span className="mono" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{done}/{pts.length}</span>
              </div>
              {pts.slice(0, 4).map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <button className={"check" + (t.done ? " on" : "")} style={{ width: 16, height: 16 }} onClick={() => toggle(t.id)}><Check size={10} strokeWidth={3} /></button>
                  <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--t3)" : "var(--tx)" }}>{t.title}</span>
                </div>
              ))}
              {pts.length > 4 && <div className="hint" style={{ padding: "3px 0 6px" }}>+ {pts.length - 4} autres tâches</div>}
              <div className="divider" />
              <div className="card-title" style={{ marginBottom: 9 }}>Dropbox <span className="mono" style={{ color: "var(--t3)" }}>{(p.files || []).length + (p.links || []).length}</span></div>
              {(p.files || []).slice(0, 3).map((f) => <FileChip key={f.id} f={f} onRemove={() => rmFile(p.id, f.id)} />)}
              {(p.links || []).slice(0, 2).map((l) => (
                <div key={l.id} className="file-chip"><Link2 size={13} style={{ color: "var(--acT)", flex: "none" }} /><a className="name" href={l.url} target="_blank" rel="noreferrer">{l.label}</a></div>
              ))}
              <DropZone compact onFiles={(fs) => addFiles(p.id, fs)} label="Déposer dans la dropbox" />
            </div>
          );
        })}
      </div>

      {open && (
        <Sheet title="Modifier le projet" sub="Enregistré automatiquement" onClose={closeSheet}
          footer={<>
            <button className="btn btn-red btn-sm" onClick={() => remove(open.id)}><Trash2 size={13} /> Supprimer</button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={closeSheet}><Check size={14} /> Fermer</button>
          </>}>
          <ProjectEditor p={open} patch={(pp) => patch(open.id, pp)} addFiles={(fs) => addFiles(open.id, fs)} rmFile={(fid) => rmFile(open.id, fid)} addLink={(l) => addLink(open.id, l)} rmLink={(lid) => rmLink(open.id, lid)} />
        </Sheet>
      )}
    </div>
  );
}
