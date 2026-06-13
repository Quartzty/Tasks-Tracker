import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RefreshCw, Video, Share2, Users, CheckSquare, Send, Plus, Check, X, Folder, Link2,
  AlertTriangle, Trophy, Trash2, BarChart3, MessageSquare,
} from "lucide-react";
import {
  uid, fmtTime, todayISO, PRIOS, SHARED_KEY, SHARED_DEFAULT, getSpaceCode, inviteUrl,
  normalizeMembers, upsertMember, computeMemberStats, computeSharedTotals, reconcileMirror,
} from "../lib/core.js";
import { kvGet, kvSet } from "../lib/storage.js";
import { Modal, DropZone, FileChip, Empty, linkify } from "../components.jsx";
import { Loader } from "../components/ui/loader.jsx";
import { StatTile } from "../components/ui/stat-tile.jsx";
import { GlowCard } from "../components/ui/glow-card.jsx";
import { MemberAvatar, MemberRow } from "../components/ui/member.jsx";
import { cn } from "../lib/cn.js";

const RANK = (i) => String(i + 1).padStart(2, "0");

export default function Shared({ profile, pushToast, data }) {
  const [shared, setShared] = useState(null);
  const [tab, setTab] = useState("productivite");
  const [msg, setMsg] = useState("");
  const [stTitle, setStTitle] = useState("");
  const [stPrio, setStPrio] = useState(3);
  const [stAssignee, setStAssignee] = useState("");
  const [folder, setFolder] = useState("Général");
  const [newFolder, setNewFolder] = useState("");
  const [invite, setInvite] = useState(false);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  const load = async (announce) => {
    const cur = normalizeMembers((await kvGet(SHARED_KEY)) || { ...SHARED_DEFAULT });
    if (profile) upsertMember(cur, profile);
    if (data && profile) reconcileMirror(cur, data, profile);
    await kvSet(SHARED_KEY, cur);
    setShared(cur);
    if (announce) pushToast("Espace partagé synchronisé");
  };
  useEffect(() => { load(false); const iv = setInterval(() => load(false), 30000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [shared && shared.messages.length, tab]);

  const mutate = async (fn) => {
    setBusy(true);
    const cur = normalizeMembers((await kvGet(SHARED_KEY)) || { ...SHARED_DEFAULT });
    if (profile) upsertMember(cur, profile);
    fn(cur);
    if (data && profile) reconcileMirror(cur, data, profile);
    await kvSet(SHARED_KEY, cur);
    setShared({ ...cur }); setBusy(false);
  };

  const send = () => { const text = msg.trim(); if (!text) return; setMsg(""); mutate((c) => c.messages.push({ id: uid(), authorId: profile.id, author: profile.name, text, ts: Date.now() })); };
  const sendFile = (fs) => mutate((c) => { fs.forEach((f) => { c.files.push({ ...f, author: profile.name, folder }); c.messages.push({ id: uid(), authorId: profile.id, author: profile.name, text: `📎 Fichier partagé : ${f.name}`, ts: Date.now() }); }); });
  const addSharedTask = () => { if (!stTitle.trim()) return; mutate((c) => c.tasks.push({ id: uid(), title: stTitle.trim(), priority: stPrio, done: false, assignee: stAssignee || null, createdBy: profile.id, author: profile.name, date: todayISO(), doneAt: null, doneBy: null })); setStTitle(""); };
  const toggleST = (id) => mutate((c) => { const t = c.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; t.doneBy = t.done ? profile.id : null; } });
  const assignST = (id, mid) => mutate((c) => { const t = c.tasks.find((x) => x.id === id); if (t) t.assignee = mid || null; });
  const delST = (id) => mutate((c) => { c.tasks = c.tasks.filter((t) => t.id !== id); });
  const dropFiles = (fs) => mutate((c) => fs.forEach((f) => c.files.push({ ...f, author: profile.name, folder })));
  const rmSharedFile = (id) => mutate((c) => { c.files = c.files.filter((f) => f.id !== id); });

  if (!shared) return <div className="grid place-items-center py-20"><Loader /></div>;

  const members = shared.members || [];
  const memberById = (id) => members.find((m) => m.id === id);
  const stats = computeMemberStats(shared);
  const totals = computeSharedTotals(shared);
  const folders = ["Général", ...Array.from(new Set(shared.files.map((f) => f.folder || "Général"))).filter((f) => f !== "Général")];
  const dayTasks = shared.tasks.slice().sort((a, b) => Number(a.done) - Number(b.done) || a.priority - b.priority);

  const TABS = [["productivite", "Productivité", BarChart3], ["tasks", "Tâches", CheckSquare], ["chat", "Discussion", MessageSquare], ["files", "Fichiers", Folder]];

  return (
    <div className="flex h-full flex-col">
      <div className="section-head">
        <div>
          <h2>Espace partagé</h2>
          <div className="hint" style={{ marginTop: 5 }}>{members.length} membre{members.length > 1 ? "s" : ""} · espace « {getSpaceCode()} » · suivi de productivité par personne</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((m) => <div key={m.id} title={m.name} className="rounded-full ring-2 ring-card"><MemberAvatar member={m} size={30} /></div>)}
            {members.length > 5 && <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-secondary text-[11px] font-semibold ring-2 ring-card">+{members.length - 5}</div>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => load(true)}><RefreshCw size={13} /> Actualiser</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { window.open("https://meet.new", "_blank"); pushToast("Crée ton Meet puis colle le lien dans la discussion"); }}><Video size={13} /> Meet</button>
          <button className="btn btn-sm" onClick={() => setInvite(true)}><Share2 size={13} /> Inviter</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map(([k, l, Ic]) => <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}><Ic size={13} style={{ verticalAlign: -2, marginRight: 6 }} />{l}</button>)}
      </div>

      {/* ----- PRODUCTIVITÉ ----- */}
      {tab === "productivite" && (
        <div>
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile value={totals.total} label="Tâches partagées" />
            <StatTile value={totals.done} label="Terminées" />
            <StatTile value={totals.rate + "%"} label="Taux d'équipe" />
            <StatTile value={totals.members} label="Membres" />
          </div>

          <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Classement</div>
          {stats.length === 0 && <Empty icon={Users}>Aucun membre pour l'instant — invite ton équipe.</Empty>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((m, i) => (
              <GlowCard key={m.id} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px] font-semibold text-muted-foreground">{RANK(i)}</span>
                  <MemberAvatar member={m} size={40} online={m.id === profile.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{m.name}{m.id === profile.id && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[10.5px] font-semibold text-muted-foreground">toi</span>}</p>
                    <p className="truncate text-[12.5px] text-muted-foreground">{m.role || "Membre"}</p>
                  </div>
                  {i === 0 && m.completedTotal > 0 && <Trophy size={17} className="text-amber-400" />}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div><div className="font-mono text-[22px] font-semibold tabular-nums">{m.completedTotal}</div><div className="text-[11px] text-muted-foreground">terminées</div></div>
                  <div><div className="font-mono text-[22px] font-semibold tabular-nums">{m.assigned}</div><div className="text-[11px] text-muted-foreground">assignées</div></div>
                  <div><div className="font-mono text-[22px] font-semibold tabular-nums">{m.rate}%</div><div className="text-[11px] text-muted-foreground">taux</div></div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-accent"><div className="h-full rounded-full bg-foreground" style={{ width: m.rate + "%" }} /></div>
              </GlowCard>
            ))}
          </div>
        </div>
      )}

      {/* ----- TÂCHES (avec assignation) ----- */}
      {tab === "tasks" && (
        <div className="card">
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <input style={{ flex: "1 1 220px" }} placeholder="Tâche d'équipe…" value={stTitle} onChange={(e) => setStTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSharedTask()} />
            <select style={{ width: 170 }} value={stAssignee} onChange={(e) => setStAssignee(e.target.value)}><option value="">Non assignée</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}{m.id === profile.id ? " (toi)" : ""}</option>)}</select>
            <select style={{ width: 130 }} value={stPrio} onChange={(e) => setStPrio(Number(e.target.value))}>{Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <button className="btn" onClick={addSharedTask}><Plus size={14} /> Ajouter</button>
          </div>
          {dayTasks.length === 0 && <Empty icon={CheckSquare}>Aucune tâche d'équipe. Crée-en une et assigne-la.</Empty>}
          {dayTasks.map((t) => {
            const asg = t.assignee ? memberById(t.assignee) : null;
            const by = t.doneBy ? memberById(t.doneBy) : null;
            if (t.mirror) {
              return (
                <div key={t.id} className={"task-row" + (t.done ? " done" : "")} style={{ cursor: "default" }} title="Tâche perso partagée — gérée depuis l'espace perso (lecture seule)">
                  <span className={"check" + (t.done ? " on" : "")} style={{ pointerEvents: "none" }}>{t.done && <Check size={12} strokeWidth={3} />}</span>
                  <span className="task-title">{t.title}</span>
                  <span className="tag" style={t.category === "watchpoint" ? null : { background: "var(--surface3)", color: "var(--t2)" }}>{t.category === "watchpoint" ? "watchpoint" : "perso"}</span>
                  <span className="task-meta">par {t.author || (asg && asg.name) || "—"}</span>
                  {asg && <MemberAvatar member={asg} size={26} />}
                  <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
                </div>
              );
            }
            return (
              <div key={t.id} className={"task-row" + (t.done ? " done" : "")} style={{ cursor: "default" }}>
                <button className={"check" + (t.done ? " on" : "")} onClick={() => toggleST(t.id)}><Check size={12} strokeWidth={3} /></button>
                <span className="task-title">{t.title}</span>
                {t.done && by && <span className="task-meta">✓ par {by.name}</span>}
                <select value={t.assignee || ""} onChange={(e) => assignST(t.id, e.target.value)} style={{ width: 150, fontSize: 12.5, padding: "6px 10px" }} title="Assigner">
                  <option value="">Assigner…</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}{m.id === profile.id ? " (toi)" : ""}</option>)}
                </select>
                {asg && <MemberAvatar member={asg} size={26} />}
                <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
                <button className="icon-btn red" onClick={() => delST(t.id)}><X size={14} /></button>
              </div>
            );
          })}
        </div>
      )}

      {/* ----- DISCUSSION ----- */}
      {tab === "chat" && (
        <div className="card chat-wrap" style={{ flex: 1, minHeight: 340 }}>
          <div className="chat-scroll" ref={scrollRef}>
            {shared.messages.length === 0 && <Empty icon={Users}>Aucun message. Lance la discussion ou partage un lien Meet.</Empty>}
            {shared.messages.map((m) => <div key={m.id} className={"msg " + (m.authorId === profile.id || m.author === profile.name ? "me" : "them")}><div className="who">{m.author} · {fmtTime(m.ts)}</div><div className="b">{linkify(m.text)}</div></div>)}
          </div>
          <div className="chat-bar">
            <div style={{ width: 150, flex: "none" }}><DropZone compact label="Fichier" onFiles={sendFile} /></div>
            <input placeholder="Écris un message, colle un lien Meet…" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn" disabled={busy} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}

      {/* ----- FICHIERS ----- */}
      {tab === "files" && (
        <div className="card">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            {folders.map((f) => <button key={f} className={"tab" + (folder === f ? " on" : "")} onClick={() => setFolder(f)}><Folder size={11} style={{ marginRight: 5, verticalAlign: -1 }} />{f}</button>)}
            <input style={{ width: 170 }} placeholder="Nouvelle dropbox…" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newFolder.trim()) { setFolder(newFolder.trim()); setNewFolder(""); } }} />
          </div>
          <DropZone onFiles={dropFiles} label={`Glisse-dépose les fichiers dans « ${folder} »`} />
          <div style={{ marginTop: 16 }}>
            {shared.files.filter((f) => (f.folder || "Général") === folder).map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, minWidth: 0 }}><FileChip f={f} onRemove={() => rmSharedFile(f.id)} /></div><span className="hint" style={{ flex: "none", marginBottom: 8 }}>par {f.author}</span></div>
            ))}
            {shared.files.filter((f) => (f.folder || "Général") === folder).length === 0 && <div className="hint" style={{ marginTop: 10 }}>Aucun fichier dans cette dropbox.</div>}
          </div>
        </div>
      )}

      {invite && (
        <Modal title="Inviter dans l'espace partagé" onClose={() => setInvite(false)}>
          <div className="hint" style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.7 }}>
            Envoie ce lien à ton équipe. À l'ouverture, chaque personne <b>crée son profil</b> (nom, avatar, rôle) puis rejoint l'espace — discussion, tâches assignables et suivi de productivité partagés.<br /><br />
            <span style={{ display: "block", padding: "11px 14px", background: "var(--surface2)", border: "1px solid var(--bd)", borderRadius: 9, fontSize: 12.5, wordBreak: "break-all", color: "var(--acT)" }}>{inviteUrl()}</span><br />
            <AlertTriangle size={13} style={{ verticalAlign: -2, color: "var(--t3)" }} /> Tout l'espace partagé est visible par <b>tous les membres</b>. Ton travail perso reste privé.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => { navigator.clipboard.writeText(inviteUrl()).then(() => pushToast("Lien d'invitation copié", "green")); }}><Link2 size={14} /> Copier le lien</button>
            <button className="btn btn-ghost" onClick={() => setInvite(false)}><Check size={14} /> Fermer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
