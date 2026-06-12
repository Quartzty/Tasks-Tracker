import React, { useState } from "react";
import { Plus, CalendarDays, ChevronLeft, ChevronRight, Clock, X, Check, ExternalLink } from "lucide-react";
import { uid, iso, todayISO, MONTHS, DOWS_L, PRIOS, fmtNice, pushAct } from "../lib/core.js";
import { Modal, MiniCalendar, Empty } from "../components.jsx";

function EventForm({ ev, projects, onSave, onDelete }) {
  const [f, setF] = useState(ev);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <div>
      <div className="field"><label>Titre</label><input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Call investisseur" autoFocus /></div>
      <div className="field"><label>Date</label><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
        <button className={"check" + (f.allDay ? " on" : "")} onClick={() => set("allDay", !f.allDay)}><Check size={12} strokeWidth={3} /></button>
        <span style={{ fontSize: 13 }}>Toute la journée</span>
      </div>
      {!f.allDay && (
        <div className="row2">
          <div className="field"><label>Début</label><input type="time" value={f.start || ""} onChange={(e) => set("start", e.target.value)} /></div>
          <div className="field"><label>Fin</label><input type="time" value={f.end || ""} onChange={(e) => set("end", e.target.value)} /></div>
        </div>
      )}
      <div className="field"><label>Lieu / lien</label><input value={f.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Google Meet, bureau…" /></div>
      <div className="field"><label>Projet</label>
        <select value={f.projectId || ""} onChange={(e) => set("projectId", e.target.value || null)}>
          <option value="">Aucun</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Notes</label><textarea rows={2} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 9 }}>
        {onDelete && <button className="btn btn-red" onClick={onDelete}><X size={14} /> Supprimer</button>}
        <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} disabled={!f.title.trim() || !f.date} onClick={() => onSave(f)}><Check size={14} /> Enregistrer</button>
      </div>
    </div>
  );
}

export default function Agenda({ data, update, itemsByDate, pushToast, selectedDate, setSelectedDate }) {
  const [month, setMonth] = useState(() => { const b = selectedDate ? new Date(selectedDate) : new Date(); return new Date(b.getFullYear(), b.getMonth(), 1); });
  const [evModal, setEvModal] = useState(null);
  const sel = selectedDate || todayISO();
  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < (offset + dim > 35 ? 42 : 35); i++) { const dn = i - offset + 1; const dt = new Date(y, m, dn); cells.push({ date: iso(dt), num: dt.getDate(), out: dn < 1 || dn > dim }); }
  const today = todayISO();
  const dayEvents = data.events.filter((e) => e.date === sel).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const dayTasks = data.tasks.filter((t) => t.date === sel).sort((a, b) => a.priority - b.priority);

  const saveEvent = (ev) => {
    update((d) => {
      if (ev.id) { const i = d.events.findIndex((x) => x.id === ev.id); if (i >= 0) d.events[i] = ev; pushAct(d, "event.edit", `Événement « ${ev.title} » modifié`, { entity: "event", entityId: ev.id, projectId: ev.projectId }); }
      else { const nev = { ...ev, id: uid(), source: "local" }; d.events.push(nev); pushAct(d, "event.create", `Événement « ${nev.title} » créé`, { entity: "event", entityId: nev.id, projectId: nev.projectId }); }
      return d;
    });
    setEvModal(null); pushToast("Événement enregistré", "green");
  };
  const delEvent = (id) => update((d) => { const e = d.events.find((x) => x.id === id); d.events = d.events.filter((x) => x.id !== id); if (e) pushAct(d, "event.delete", `Événement « ${e.title} » supprimé`, { entity: "event", entityId: id }); return d; });
  const toggleTask = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; t.status = t.done ? "done" : "todo"; } return d; });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "276px 1fr", gap: 16, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div className="card"><MiniCalendar month={month} setMonth={setMonth} selected={sel} onSelect={setSelectedDate} itemsByDate={itemsByDate} /></div>
        <div className="card">
          <div className="card-title">{fmtNice(sel)}</div>
          {dayEvents.length === 0 && dayTasks.length === 0 && <Empty icon={Clock}>Rien de prévu ce jour-là.</Empty>}
          {dayEvents.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", background: "var(--acs)", borderRadius: 10, marginBottom: 7 }}>
              <CalendarDays size={14} style={{ color: "var(--acT)", flex: "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                <div style={{ fontSize: 11, color: "var(--t2)" }}>{e.allDay ? "Journée" : (e.start || "") + (e.end ? " – " + e.end : "")}{e.location ? " · " + e.location : ""}</div>
              </div>
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setEvModal(e)}><ChevronRight size={13} /></button>
            </div>
          ))}
          {dayTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 4px" }}>
              <button className={"check" + (t.done ? " on" : "")} style={{ width: 17, height: 17 }} onClick={() => toggleTask(t.id)}><Check size={11} strokeWidth={3} /></button>
              <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--t3)" : "var(--tx)" }}>{t.title}</span>
              <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setEvModal({ title: "", date: sel, start: "", end: "", allDay: false, location: "", url: "", projectId: null, notes: "" })}><Plus size={13} /> Ajouter un événement</button>
        </div>
      </div>

      <div className="card">
        <div className="cal-head">
          <span className="m">{MONTHS[m]} {y}</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setSelectedDate(todayISO()); }}>Aujourd'hui</button>
            <button className="icon-btn" onClick={() => setMonth(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
            <button className="icon-btn" onClick={() => setMonth(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
            <button className="btn btn-sm" onClick={() => setEvModal({ title: "", date: sel, start: "", end: "", allDay: false, location: "", url: "", projectId: null, notes: "" })}><Plus size={13} /> Événement</button>
          </span>
        </div>
        <div className="cal-grid" style={{ marginBottom: 6 }}>{DOWS_L.map((d) => <div key={d} className="cal-dow">{d}</div>)}</div>
        <div className="cal-grid">
          {cells.map((c, i) => {
            const items = itemsByDate[c.date] || [];
            const shown = [...items.filter((x) => x.type === "event"), ...items.filter((x) => x.type === "task")].slice(0, 3);
            return (
              <div key={i} className={"cal-cell" + (c.out ? " out" : "") + (c.date === today ? " today" : "") + (c.date === sel ? " sel" : "")} onClick={() => setSelectedDate(c.date)}>
                <div className="cal-num">{c.num}</div>
                {shown.map((it, j) => (
                  <div key={j} className={"cal-chip " + (it.type === "event" ? "ev" : "tk")}>
                    {it.type === "task" && <span className="pd" style={{ background: (PRIOS[it.priority] || PRIOS[3]).color }} />}{it.time ? it.time + " " : ""}{it.title}
                  </div>
                ))}
                {items.length > 3 && <div className="cal-more">+{items.length - 3}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {evModal && (
        <Modal title={evModal.id ? "Modifier l'événement" : "Nouvel événement"} onClose={() => setEvModal(null)}>
          <EventForm ev={evModal} projects={data.projects} onSave={saveEvent} onDelete={evModal.id ? () => { delEvent(evModal.id); setEvModal(null); } : null} />
        </Modal>
      )}
    </div>
  );
}
