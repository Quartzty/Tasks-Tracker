import React, { useState, useRef } from "react";
import { Upload, Download, Database, Trash2, Check, Sun, Moon } from "lucide-react";
import { parseICS, buildICS, download, DATA_KEY, SEED, migrate, saveProfile, MEMBER_COLORS, ROLE_SUGGESTIONS } from "../lib/core.js";
import { cloudEnabled, kvDel } from "../lib/storage.js";
import { ACCENTS } from "../lib/theme.js";
import { MemberAvatar } from "../components/ui/member.jsx";

function SyncCard({ pushToast }) {
  const [pc, setPc] = useState(localStorage.getItem("tt:code") || "");
  const [sc, setSc] = useState(localStorage.getItem("tt:space") || "");
  const apply = (k, v, label) => { if (!v.trim()) return; localStorage.setItem(k, v.trim()); pushToast(label + " mis à jour — rechargement…", "green"); setTimeout(() => window.location.replace(window.location.pathname), 700); };
  return (
    <div className="card span6">
      <div className="card-title">Synchronisation cloud</div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
        <span className="status-dot" style={{ background: cloudEnabled ? "var(--gn)" : "var(--t3)" }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{cloudEnabled ? "Supabase connecté — données synchronisées entre tes appareils" : "Mode local — les données restent dans ce navigateur"}</span>
      </div>
      <div className="field"><label>Mon code de synchronisation (note-le)</label>
        <div style={{ display: "flex", gap: 8 }}><input value={pc} onChange={(e) => setPc(e.target.value)} /><button className="btn btn-ghost btn-sm" style={{ flex: "none" }} onClick={() => apply("tt:code", pc, "Code personnel")}>Utiliser</button></div>
      </div>
      <div className="field"><label>Code de l'espace partagé</label>
        <div style={{ display: "flex", gap: 8 }}><input value={sc} onChange={(e) => setSc(e.target.value)} /><button className="btn btn-ghost btn-sm" style={{ flex: "none" }} onClick={() => apply("tt:space", sc, "Espace partagé")}>Rejoindre</button></div>
      </div>
      {!cloudEnabled && <div className="hint">Active la persistance cloud : ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables Vercel — voir le README.</div>}
    </div>
  );
}

export default function Settings({ data, update, pushToast, setData, profile, setProfile }) {
  const icsRef = useRef(null);
  const bakRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const s = data.settings;
  const prof = profile || { name: s.userName, color: "#FAFAFA", role: "" };

  const patchProfile = (partial) => {
    const next = { ...prof, ...partial };
    if (partial.name != null) update((d) => { d.settings.userName = partial.name; return d; });
    if (setProfile) setProfile(saveProfile(next));
  };

  const importICS = async (file) => { const evs = parseICS(await file.text()); if (!evs.length) { pushToast("Aucun événement dans ce .ics", "red"); return; } update((d) => { d.events = [...d.events, ...evs]; return d; }); pushToast(`${evs.length} événement(s) importé(s)`, "green"); };
  const exportICS = () => { download("tasks-tracker.ics", buildICS(data.events, data.tasks), "text/calendar"); pushToast("Agenda exporté (.ics)", "green"); };
  const exportJSON = () => { download("tasks-tracker-backup.json", JSON.stringify(data, null, 2), "application/json"); pushToast("Sauvegarde téléchargée", "green"); };
  const importJSON = async (file) => { try { const obj = JSON.parse(await file.text()); if (!obj.tasks) throw new Error("format"); setData(migrate(obj)); pushToast("Sauvegarde restaurée", "green"); } catch { pushToast("Fichier invalide", "red"); } };
  const reset = async () => { await kvDel(DATA_KEY); setData(structuredClone(SEED)); setConfirmReset(false); pushToast("Application réinitialisée", "red"); };

  const ConnRow = ({ name, hint }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 0", borderBottom: "1px solid var(--bd)" }}>
      <span className="status-dot" style={{ background: "var(--t3)" }} />
      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div className="hint">{hint}</div></div>
      <button className="btn btn-ghost btn-sm" onClick={() => icsRef.current && icsRef.current.click()}><Upload size={12} /> Importer .ics</button>
    </div>
  );

  return (
    <div className="bento">
      <div className="card span6">
        <div className="card-title">Mon profil</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <MemberAvatar member={{ name: prof.name || "Moi", color: prof.color }} size={48} online />
          <div><div style={{ fontSize: 15, fontWeight: 600 }}>{prof.name || "Moi"}</div><div className="hint">{prof.role || "Membre"}</div></div>
        </div>
        <div className="field"><label>Ton nom (affiché dans l'espace partagé)</label><input value={prof.name} onChange={(e) => patchProfile({ name: e.target.value })} /></div>
        <div className="row2">
          <div className="field"><label>Rôle</label>
            <select value={ROLE_SUGGESTIONS.includes(prof.role) ? prof.role : ""} onChange={(e) => patchProfile({ role: e.target.value })}>
              <option value="">— rôle —</option>{ROLE_SUGGESTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field"><label>Couleur d'avatar</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", paddingTop: 3 }}>
              {MEMBER_COLORS.map((c) => <button key={c} onClick={() => patchProfile({ color: c })} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: prof.color === c ? "2px solid var(--tx)" : "2px solid transparent" }} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="card span6">
        <div className="card-title">Apparence</div>
        <div className="field"><label>Thème</label>
          <div className="segmented">
            <button className={s.theme === "dark" ? "on" : ""} onClick={() => update((d) => { d.settings.theme = "dark"; return d; })}><Moon size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Sombre</button>
            <button className={s.theme === "light" ? "on" : ""} onClick={() => update((d) => { d.settings.theme = "light"; return d; })}><Sun size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Clair</button>
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}><label>Couleur d'accent</label>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            {ACCENTS.map((a) => <button key={a.id} title={a.label} onClick={() => update((d) => { d.settings.accent = a.hex; return d; })} style={{ width: 28, height: 28, borderRadius: 9, background: a.hex, border: s.accent === a.hex ? "2px solid var(--tx)" : "2px solid transparent" }} />)}
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, width: "auto", border: "none", padding: 0, background: "none" }}>
              <input type="color" value={s.accent} onChange={(e) => update((d) => { d.settings.accent = e.target.value; return d; })} style={{ width: 34, height: 28, padding: 2, cursor: "pointer" }} />
              <span className="hint">personnalisée</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card span6">
        <div className="card-title">Rappels</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button className={"check" + (s.remindersOn ? " on" : "")} onClick={() => update((d) => { d.settings.remindersOn = !d.settings.remindersOn; return d; })}><Check size={12} strokeWidth={3} /></button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications de rappel (tâches & événements horodatés)</span>
        </div>
        <div className="field" style={{ marginBottom: 0 }}><label>Me prévenir avant</label>
          <select value={s.reminderMinutes} onChange={(e) => update((d) => { d.settings.reminderMinutes = Number(e.target.value); return d; })}>
            <option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 heure</option>
          </select>
        </div>
      </div>

      <SyncCard pushToast={pushToast} />

      <div className="card span6">
        <div className="card-title">Calendriers connectés</div>
        <ConnRow name="Google Calendar" hint="Google Agenda → Paramètres → Exporter, puis importe le .ics ici." />
        <ConnRow name="Apple Calendar" hint="Calendrier (Mac) → Fichier → Exporter, puis importe le .ics ici." />
        <input ref={icsRef} type="file" accept=".ics" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { importICS(e.target.files[0]); e.target.value = ""; } }} />
        <div style={{ marginTop: 13 }}><button className="btn btn-sm" onClick={exportICS}><Download size={12} /> Exporter mon agenda (.ics)</button></div>
      </div>

      <div className="card span6">
        <div className="card-title">Données & sauvegarde</div>
        <div className="hint" style={{ marginBottom: 13 }}>
          <Database size={12} style={{ verticalAlign: -2, marginRight: 5, color: cloudEnabled ? "var(--gn)" : "var(--t3)" }} />
          {cloudEnabled ? "Tes données sont sur Supabase : elles survivent au vidage du cache et au changement d'appareil." : "Mode local : exporte régulièrement une sauvegarde, ou active Supabase pour la persistance cloud."}
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={exportJSON}><Download size={12} /> Exporter (.json)</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bakRef.current && bakRef.current.click()}><Upload size={12} /> Restaurer (.json)</button>
          <input ref={bakRef} type="file" accept=".json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { importJSON(e.target.files[0]); e.target.value = ""; } }} />
        </div>
        <div className="divider" />
        {!confirmReset ? <button className="btn btn-red btn-sm" onClick={() => setConfirmReset(true)}><Trash2 size={12} /> Réinitialiser l'application</button>
          : <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span style={{ fontSize: 12.5, color: "var(--rd)", fontWeight: 600 }}>Tout supprimer définitivement ?</span><button className="btn btn-red btn-sm" onClick={reset}><Check size={12} /> Oui</button><button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Annuler</button></div>}
      </div>
    </div>
  );
}
