import React, { useState, useRef } from "react";
import { Plus, Mail, Phone, Trash2, Check, X } from "lucide-react";
import { uid, STAGES, pushAct } from "../lib/core.js";
import { Modal } from "../components.jsx";

function ContactForm({ c, onSave, onDelete }) {
  const [f, setF] = useState(c);
  const [tag, setTag] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <div>
      <div className="row2">
        <div className="field"><label>Nom</label><input value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></div>
        <div className="field"><label>Société</label><input value={f.company || ""} onChange={(e) => set("company", e.target.value)} /></div>
      </div>
      <div className="row2">
        <div className="field"><label>Email</label><input value={f.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="field"><label>Téléphone</label><input value={f.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div className="row2">
        <div className="field"><label>Étape</label><select value={f.stage} onChange={(e) => set("stage", e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="field"><label>Valeur (€)</label><input type="number" value={f.value || ""} onChange={(e) => set("value", e.target.value)} /></div>
      </div>
      <div className="field"><label>Tags</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 7 }}>
          {(f.tags || []).map((t) => <span key={t} className="tag" style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>{t}<X size={11} style={{ cursor: "pointer" }} onClick={() => set("tags", f.tags.filter((x) => x !== t))} /></span>)}
        </div>
        <input placeholder="Ajouter un tag, Entrée…" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = tag.trim(); if (t && !(f.tags || []).includes(t)) set("tags", [...(f.tags || []), t]); setTag(""); } }} />
      </div>
      <div className="field"><label>Notes</label><textarea rows={3} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 9 }}>
        {onDelete && <button className="btn btn-red" onClick={onDelete}><Trash2 size={14} /> Supprimer</button>}
        <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} disabled={!f.name.trim()} onClick={() => onSave(f)}><Check size={14} /> Enregistrer</button>
      </div>
    </div>
  );
}

export default function Crm({ data, update, pushToast }) {
  const [modal, setModal] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const dragId = useRef(null);

  const save = (c) => {
    update((d) => {
      if (c.id) { const i = d.contacts.findIndex((x) => x.id === c.id); if (i >= 0) d.contacts[i] = c; pushAct(d, "contact.edit", `Contact « ${c.name} » modifié`, { entity: "contact", entityId: c.id }); }
      else { const nc = { ...c, id: uid() }; d.contacts.push(nc); pushAct(d, "contact.create", `Contact « ${nc.name} » ajouté`, { entity: "contact", entityId: nc.id }); }
      return d;
    });
    setModal(null); pushToast("Contact enregistré", "green");
  };
  const remove = (id) => { update((d) => { const c = d.contacts.find((x) => x.id === id); d.contacts = d.contacts.filter((x) => x.id !== id); if (c) pushAct(d, "contact.delete", `Contact « ${c.name} » supprimé`, { entity: "contact", entityId: id }); return d; }); setModal(null); pushToast("Contact supprimé", "red"); };
  const moveTo = (stage) => {
    const id = dragId.current; if (!id) return;
    update((d) => { const c = d.contacts.find((x) => x.id === id); if (c && c.stage !== stage) { pushAct(d, "contact.move", `Contact « ${c.name} » déplacé vers ${stage}`, { entity: "contact", entityId: id }); c.stage = stage; } return d; });
    setOverCol(null);
  };
  const total = data.contacts.reduce((s, c) => s + (Number(c.value) || 0), 0);

  return (
    <div>
      <div className="section-head">
        <div><h2>CRM</h2><div className="hint" style={{ marginTop: 4 }}>{data.contacts.length} contact{data.contacts.length > 1 ? "s" : ""} · pipeline total : <b style={{ color: "var(--acT)" }}>{total.toLocaleString("fr-FR")} €</b></div></div>
        <button className="btn" onClick={() => setModal({ name: "", company: "", email: "", phone: "", stage: "Lead", value: "", notes: "", tags: [] })}><Plus size={14} /> Nouveau contact</button>
      </div>
      <div className="crm-board">
        {STAGES.map((st) => {
          const cards = data.contacts.filter((c) => c.stage === st);
          const colTotal = cards.reduce((s, c) => s + (Number(c.value) || 0), 0);
          return (
            <div key={st} className={"crm-col" + (overCol === st ? " over" : "")}
              onDragOver={(e) => { e.preventDefault(); setOverCol(st); }} onDragLeave={() => setOverCol(null)} onDrop={(e) => { e.preventDefault(); moveTo(st); }}>
              <div className="crm-col-head"><span className="n">{st}</span><span className="mono" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700 }}>{cards.length}{colTotal ? " · " + colTotal.toLocaleString("fr-FR") + " €" : ""}</span></div>
              {cards.map((c) => (
                <div key={c.id} className="crm-card" draggable onDragStart={() => { dragId.current = c.id; }} onClick={() => setModal(c)}>
                  <div className="nm">{c.name}</div>
                  {c.company && <div className="co">{c.company}</div>}
                  {(c.tags || []).length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
                  <div style={{ display: "flex", gap: 9, marginTop: 7, color: "var(--t3)" }}>{c.email && <Mail size={12} />}{c.phone && <Phone size={12} />}</div>
                  {Number(c.value) > 0 && <div className="val">{Number(c.value).toLocaleString("fr-FR")} €</div>}
                </div>
              ))}
              {cards.length === 0 && <div className="hint" style={{ textAlign: "center", padding: "18px 0" }}>Glisse un contact ici</div>}
            </div>
          );
        })}
      </div>
      {modal && <Modal title={modal.id ? "Contact" : "Nouveau contact"} onClose={() => setModal(null)}><ContactForm c={modal} onSave={save} onDelete={modal.id ? () => remove(modal.id) : null} /></Modal>}
    </div>
  );
}
