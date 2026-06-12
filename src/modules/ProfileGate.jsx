import React, { useState } from "react";
import { ArrowRight, Users, Check, ShieldCheck } from "lucide-react";
import { MEMBER_COLORS, ROLE_SUGGESTIONS, saveProfile, getSpaceCode } from "../lib/core.js";
import { MemberAvatar } from "../components/ui/member.jsx";
import { GlowCard } from "../components/ui/glow-card.jsx";

/* Page d'auth légère : création de profil pour rejoindre un espace partagé via lien. */
export default function ProfileGate({ spaceName, onComplete }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [color, setColor] = useState(MEMBER_COLORS[4]);
  const preview = { name: name || "Toi", color };
  const canSubmit = name.trim().length >= 1;

  const submit = () => { if (!canSubmit) return; onComplete(saveProfile({ name, role, color })); };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-primary text-[13px] font-bold text-primary-foreground">T</div>
          <span className="text-[15px] font-bold tracking-tight">Tasks Tracker</span>
        </div>

        <GlowCard className="p-7">
          {/* En-tête type TeamInvitation */}
          <div className="mb-6 flex items-start gap-3.5">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-full border border-border bg-secondary"><Users size={18} className="text-muted-foreground" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Invitation</p>
              <h1 className="mt-0.5 text-[18px] font-semibold leading-tight">Rejoins l'espace partagé{spaceName ? <> « {spaceName} »</> : null}</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">Crée ton profil pour collaborer : tâches, discussion, fichiers et suivi de productivité d'équipe.</p>
            </div>
          </div>

          {/* Aperçu live de l'avatar */}
          <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <MemberAvatar member={preview} size={44} online />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{preview.name}</p>
              <p className="truncate text-[12.5px] text-muted-foreground">{role.trim() || "Membre"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Ton nom</label>
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Ex. Léo Martin" autoFocus />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Couleur d'avatar</label>
              <div className="flex flex-wrap gap-2.5">
                {MEMBER_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className="h-7 w-7 rounded-full transition-transform hover:scale-110" style={{ background: c, outline: color === c ? "2px solid var(--tx)" : "2px solid transparent", outlineOffset: 2 }} />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Ton rôle <span className="font-normal normal-case text-muted-foreground/70">(optionnel)</span></label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex. Designer" />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {ROLE_SUGGESTIONS.map((r) => (
                  <button key={r} onClick={() => setRole(r)} className={"inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors " + (role === r ? "border-foreground bg-accent text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground")}>{role === r && <Check size={12} />}{r}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={submit} disabled={!canSubmit} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-40">
            Rejoindre l'espace <ArrowRight size={16} />
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted-foreground">
            <ShieldCheck size={13} /> Profil léger, sans mot de passe — modifiable à tout moment dans Réglages.
          </p>
        </GlowCard>

        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground/60">espace « {getSpaceCode()} »</p>
      </div>
    </div>
  );
}
