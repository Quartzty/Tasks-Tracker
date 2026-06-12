import React from "react";
import { cn } from "../../lib/cn.js";
import { initials } from "../../lib/core.js";

/* Avatar membre — initiales monochromes, point « en ligne » vert, fin liseré
   à la couleur du membre (seule touche d'identité, discrète). */
export function MemberAvatar({ member, size = 40, online }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full bg-secondary font-semibold text-foreground"
        style={{ fontSize: Math.round(size * 0.36), boxShadow: `inset 0 0 0 1.5px ${member.color || "var(--border)"}55` }}
      >
        {initials(member.name)}
      </div>
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />}
    </div>
  );
}

/* Ligne membre — dérivée du composant TeamInvitation 21st.dev (monochrome). */
export function MemberRow({ member, online, right, sub, className }) {
  return (
    <div className={cn("flex items-center gap-3.5 rounded-xl border border-border bg-secondary/40 px-4 py-3 transition-colors hover:border-muted-foreground/40", className)}>
      <MemberAvatar member={member} online={online} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium">{member.name}{member.isMe && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[10.5px] font-semibold text-muted-foreground">toi</span>}</p>
        <p className="truncate text-[12.5px] text-muted-foreground">{sub || member.role || "Membre"}</p>
      </div>
      {right}
    </div>
  );
}
