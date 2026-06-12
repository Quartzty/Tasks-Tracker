import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X, Check, Upload, FileText, Download, ChevronLeft, ChevronRight, Search,
  CircleCheck, Folder, Lightbulb, User, Calendar, File, CornerDownLeft,
  Plus, Edit3, Trash2, ArrowRight, Paperclip, RotateCcw, FolderPlus,
  CalendarPlus, UserPlus, ArrowUpDown, X as XIcon, RefreshCw,
} from "lucide-react";
import {
  uid, iso, todayISO, MONTHS, DOWS, PRIOS, STATUS, fmtSize, fmtNice,
  readFiles, universalSearch,
} from "./lib/core.js";

/* ------------------------------ linkify -------------------------------- */
export function linkify(text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p)
      ? <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a>
      : <React.Fragment key={i}>{p}</React.Fragment>);
}

/* ------------------------------ Toasts --------------------------------- */
export function Toasts({ toasts }) {
  return <div className="toasts">{toasts.map((t) => <div key={t.id} className={"toast " + (t.kind || "")}>{t.text}</div>)}</div>;
}

/* ------------------------------ Modal ---------------------------------- */
export function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" style={width ? { width } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn red" onClick={onClose}><X size={16} /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------ Slide-over (édition) ------------------------- */
export function Sheet({ title, sub, onClose, children, footer }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-head">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em" }}>{title}</div>
            {sub && <div className="hint" style={{ marginTop: 3 }}>{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>
  );
}

/* ------------------------------ Pills ---------------------------------- */
export function PrioPill({ p, onClick }) {
  const pr = PRIOS[p] || PRIOS[3];
  return <button className="prio" onClick={onClick} title="Changer la priorité"><span className="prio-dot" style={{ background: pr.color }} />{pr.label}</button>;
}
export function StatusPill({ s }) {
  const st = STATUS[s] || STATUS.todo;
  return <span className="statpill" style={{ background: "color-mix(in srgb," + st.color + " 16%, transparent)", color: st.color }}><span className="prio-dot" style={{ background: st.color }} />{st.label}</span>;
}

/* ------------------------------ Empty ---------------------------------- */
export function Empty({ icon: Ic, children }) {
  return <div className="empty">{Ic && <Ic size={22} />}{children}</div>;
}

/* ----------------------------- DropZone -------------------------------- */
export function DropZone({ onFiles, label = "Glisse-dépose tes fichiers, ou clique", compact }) {
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  return (
    <div className={"dropzone" + (over ? " over" : "")} style={compact ? { padding: 11, flexDirection: "row" } : null}
      onClick={() => ref.current && ref.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={async (e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files && e.dataTransfer.files.length) onFiles(await readFiles(e.dataTransfer.files)); }}>
      <Upload size={compact ? 14 : 18} /><span>{label}</span>
      <input ref={ref} type="file" multiple style={{ display: "none" }}
        onChange={async (e) => { if (e.target.files.length) { onFiles(await readFiles(e.target.files)); e.target.value = ""; } }} />
    </div>
  );
}
export function FileChip({ f, onRemove }) {
  return (
    <div className="file-chip">
      <FileText size={14} style={{ color: "var(--acT)", flex: "none" }} />
      <span className="name">{f.name}</span>
      <span className="size">{fmtSize(f.size)}</span>
      {f.content
        ? <a href={f.content} download={f.name} className="icon-btn" style={{ width: 26, height: 26 }} title="Télécharger"><Download size={13} /></a>
        : <span className="size" title="Fichier > 1,8 Mo : métadonnées seules">méta</span>}
      {onRemove && <button className="icon-btn red" style={{ width: 26, height: 26 }} onClick={onRemove}><X size={13} /></button>}
    </div>
  );
}

/* --------------------------- Mini calendar ----------------------------- */
export function MiniCalendar({ month, setMonth, selected, onSelect, itemsByDate }) {
  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dn = i - offset + 1;
    const dt = new Date(y, m, dn);
    cells.push({ date: iso(dt), num: dt.getDate(), out: dn < 1 || dn > dim });
  }
  const today = todayISO();
  return (
    <div className="mini-cal">
      <div className="mini-head">
        <span className="m">{MONTHS[m]} {y}</span>
        <span style={{ display: "flex", gap: 2 }}>
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setMonth(new Date(y, m - 1, 1))}><ChevronLeft size={14} /></button>
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setMonth(new Date(y, m + 1, 1))}><ChevronRight size={14} /></button>
        </span>
      </div>
      <div className="mini-grid">
        {DOWS.map((d) => <div key={d} className="mini-dow">{d}</div>)}
        {cells.map((c, i) => {
          const items = itemsByDate[c.date] || [];
          const dots = [];
          if (items.some((it) => it.type === "event")) dots.push("var(--ac)");
          if (items.some((it) => it.type === "task" && it.priority === 1)) dots.push("var(--rd)");
          if (items.some((it) => it.type === "task" && it.priority !== 1)) dots.push("var(--t2b)");
          return (
            <div key={i} className={"mini-day" + (c.out ? " out" : "") + (c.date === today ? " today" : "") + (c.date === selected ? " sel" : "")}
              onClick={() => onSelect && onSelect(c.date)}>
              <span>{c.num}</span>
              <span className="mini-dots">{dots.slice(0, 3).map((col, j) => <i key={j} style={{ background: col }} />)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Charts --------------------------------- */
export function Sparkline({ points, color = "var(--ac)", height = 44 }) {
  if (!points || points.length < 2) return <div className="hint">Pas encore de données.</div>;
  const max = Math.max(1, ...points), min = Math.min(...points);
  const span = max - min || 1;
  const w = 200, h = height;
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - 4 - ((v - min) / span) * (h - 8)}`).join(" ");
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} height={height} preserveAspectRatio="none" role="img" aria-label="Tendance"><polyline fill="none" stroke={color} strokeWidth="2" points={pts} /></svg>;
}

export function AreaChart({ series, height = 96 }) {
  const max = Math.max(1, ...series.map((s) => Math.max(s.created, s.done)));
  const w = 320, h = height, pad = 6;
  const x = (i) => pad + (i / (series.length - 1)) * (w - pad * 2);
  const yv = (v) => h - pad - (v / max) * (h - pad * 2);
  const line = (key) => series.map((s, i) => `${x(i).toFixed(1)},${yv(s[key]).toFixed(1)}`).join(" ");
  const area = `M${line("done").split(" ").join(" L")} L${x(series.length - 1).toFixed(1)},${h - pad} L${x(0).toFixed(1)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label="Tâches créées et terminées">
      <path d={area} fill="var(--acs)" />
      <polyline fill="none" stroke="var(--ac)" strokeOpacity=".45" strokeWidth="2" points={line("done")} />
      <polyline fill="none" stroke="var(--ac)" strokeWidth="2" points={line("created")} />
    </svg>
  );
}

export function Donut({ segments, size = 92 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Répartition">
      <g transform="rotate(-90 40 40)">
        <circle cx="40" cy="40" r="33" fill="none" stroke="var(--surface3)" strokeWidth="11" />
        {segments.map((s, i) => {
          const pct = (s.value / total) * 100;
          const el = <circle key={i} cx="40" cy="40" r="33" fill="none" stroke={s.color} strokeWidth="11" pathLength="100" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} />;
          acc += pct;
          return el;
        })}
      </g>
    </svg>
  );
}

export function Bars({ items }) {
  return (
    <div className="bars">
      {items.map((it, i) => (
        <div className="b" key={i}>
          <span style={{ width: 86, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          <span className="tr"><i style={{ width: it.pct + "%", background: it.color || "var(--ac)" }} /></span>
          <span className="mono" style={{ width: 38, textAlign: "right", color: "var(--t2)" }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Heatmap({ cells, max }) {
  return (
    <div className="heat">
      {cells.map((c, i) => {
        const a = c.count ? Math.round((0.18 + 0.82 * (c.count / max)) * 100) : 0;
        return <div key={i} className="c" title={`${c.day} · ${c.count}`} style={a ? { background: `color-mix(in srgb, var(--ac) ${a}%, var(--surface3))` } : null} />;
      })}
    </div>
  );
}

/* ----------------------------- Timeline -------------------------------- */
const ACT_LUCIDE = {
  "task.create": Plus, "task.edit": Edit3, "task.done": Check, "task.reopen": RotateCcw,
  "task.delete": Trash2, "task.move": ArrowUpDown,
  "event.create": CalendarPlus, "event.edit": Edit3, "event.delete": Trash2,
  "project.create": FolderPlus, "project.edit": Edit3, "project.delete": Trash2,
  "file.add": Paperclip, "file.remove": XIcon,
  "contact.create": UserPlus, "contact.edit": Edit3, "contact.move": ArrowRight, "contact.delete": Trash2,
  "note.create": Lightbulb, "note.edit": Edit3, "note.delete": Trash2,
};
const ACT_DOT = { "task.done": "gn", "contact.move": "am", "task.delete": "rd", "event.delete": "rd", "project.delete": "rd", "note.delete": "rd" };
export function Timeline({ items, projName }) {
  if (!items.length) return <Empty>Aucune activité pour l'instant. Tes actions s'inscriront ici.</Empty>;
  return (
    <div className="tl">
      {items.map((a) => {
        const Ic = ACT_LUCIDE[a.type] || Edit3;
        const tag = a.projectId && projName ? projName(a.projectId) : a.tagLabel;
        return (
          <div className="tli" key={a.id}>
            <span className={"tl-dot " + (ACT_DOT[a.type] || "")} />
            <div className="tl-tx"><span className="ic"><Ic size={13} /></span><span>{a.summary}</span>{tag && <span className="tag">{tag}</span>}</div>
            <div className="tl-time">{new Date(a.ts).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------- Command palette (⌘K) — composant 21st.dev ----- */
function fuzzyMatch(text, query) {
  const t = text.toLowerCase(), q = query.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) if (t[i] === q[qi]) qi++;
  return qi === q.length;
}

export function CommandPalette({ open, onClose, commands = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    return commands.filter((c) => fuzzyMatch([c.label, ...(c.keywords || [])].join(" "), searchQuery));
  }, [commands, searchQuery]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((c) => { (g[c.group] = g[c.group] || []).push(c); });
    return Object.entries(g).map(([label, cmds]) => ({ label, commands: cmds }));
  }, [filtered]);

  const flat = useMemo(() => grouped.flatMap((g) => g.commands), [grouped]);

  useEffect(() => { if (open) { setSearchQuery(""); setSelectedIndex(0); const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 30); return () => clearTimeout(t); } }, [open]);
  useEffect(() => { setSelectedIndex(0); }, [searchQuery]);
  useEffect(() => { const el = itemRefs.current[selectedIndex]; if (el) el.scrollIntoView({ block: "nearest" }); }, [selectedIndex]);

  if (!open) return null;

  const close = () => { onClose(); setSearchQuery(""); setSelectedIndex(0); };
  const run = (c) => { if (c) { c.action(); close(); } };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => (p + 1) % Math.max(flat.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => (p - 1 + flat.length) % Math.max(flat.length, 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(flat[selectedIndex]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  };

  const kbd = (extra) => ({ padding: "2px 6px", background: "var(--secondary)", color: "var(--muted-foreground)", borderRadius: 4, fontSize: 11, fontFamily: "var(--mono)", border: "1px solid var(--border)", ...extra });
  let idx = 0;

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh", zIndex: 9999, backdropFilter: "blur(3px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--popover)", borderRadius: 14, width: "100%", maxWidth: 640, boxShadow: "0 24px 60px rgba(0,0,0,.5)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: 16, borderBottom: "1px solid var(--border)" }}>
          <Search size={20} style={{ color: "var(--muted-foreground)", marginRight: 12, flexShrink: 0 }} />
          <input ref={inputRef} type="text" placeholder="Tape une commande ou recherche…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={onKeyDown}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--foreground)", fontSize: 16, fontFamily: "inherit", padding: 0, boxShadow: "none", width: "auto" }} />
          <kbd style={kbd()}>ESC</kbd>
        </div>
        <div ref={listRef} style={{ maxHeight: 400, overflowY: "auto", padding: 8 }}>
          {grouped.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)" }}>Aucun résultat</div>
          ) : grouped.map((group) => (
            <div key={group.label} style={{ marginBottom: 12 }}>
              <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".5px" }}>{group.label}</div>
              {group.commands.map((c) => {
                const i = idx++; const sel = i === selectedIndex;
                return (
                  <div key={c.id} ref={(el) => { itemRefs.current[i] = el; }} onClick={() => run(c)} onMouseEnter={() => setSelectedIndex(i)}
                    style={{ display: "flex", alignItems: "center", padding: 12, borderRadius: 8, cursor: "pointer", background: sel ? "var(--accent)" : "transparent", color: "var(--foreground)", transition: "background-color .12s" }}>
                    <span style={{ display: "flex", alignItems: "center", marginRight: 12, color: sel ? "var(--primary)" : "var(--muted-foreground)" }}>{c.icon}</span>
                    <span style={{ flex: 1, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
                    {c.shortcut && <span style={{ display: "flex", gap: 4 }}>{c.shortcut.split(" ").map((k, j) => <kbd key={j} style={kbd()}>{k}</kbd>)}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--muted-foreground)" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span><kbd style={kbd({ marginRight: 4 })}>↑↓</kbd>Naviguer</span>
            <span><kbd style={kbd({ marginRight: 4 })}>↵</kbd>Sélectionner</span>
          </div>
          <span><kbd style={kbd()}>⌘K</kbd> pour ouvrir / fermer</span>
        </div>
      </div>
    </div>
  );
}
