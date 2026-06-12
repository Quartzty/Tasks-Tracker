import React, { useState, useMemo } from "react";
import {
  CheckCircle2, CalendarDays, Check, AlertTriangle, Flame, Layers, UserPlus, Moon, Sparkles,
  ArrowUpRight, ArrowDownRight, ArrowRight, Plus, Command, Clock3, ListChecks,
} from "lucide-react";
import { uid, todayISO, dPlus, iso, MONTHS, DOWS_L, PRIOS, computeInsights, computeStats, pushAct } from "../lib/core.js";
import { Sparkline, MiniCalendar } from "../components.jsx";
import { Card, CardContent, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { cn } from "../lib/cn.js";

const INSIGHT_ICON = { "alert-triangle": AlertTriangle, "flame": Flame, "stack-2": Layers, "user-up": UserPlus, "zzz": Moon, "sparkles": Sparkles };

function Stat({ label, value, delta, deltaType, danger }) {
  return (
    <Card>
      <CardContent className="px-6 py-6">
        <div className="flex items-center justify-between">
          <span className="truncate text-[14px] text-muted-foreground">{label}</span>
          {delta != null && <span className="inline-flex items-center gap-0.5 text-[12.5px] font-medium text-muted-foreground">{deltaType === "down" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{delta}</span>}
        </div>
        <div className={cn("mt-3 font-mono text-[32px] font-semibold leading-none tracking-tight tabular-nums", danger && value > 0 && "text-destructive")}>{value}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ data, update, itemsByDate, goTo, setSelectedDate }) {
  const [miniMonth, setMiniMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = todayISO();
  const tToday = data.tasks.filter((t) => t.date === today && !t.done);
  const late = data.tasks.filter((t) => t.date && t.date < today && !t.done);
  const doneWeek = data.tasks.filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) >= dPlus(-6));
  const donePrevWeek = data.tasks.filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) >= dPlus(-13) && iso(new Date(t.doneAt)) <= dPlus(-7));
  const evToday = data.events.filter((e) => e.date === today);
  const upcoming = data.events.filter((e) => e.date >= today).sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || ""))).slice(0, 5);
  const insights = useMemo(() => computeInsights(data), [data]);
  const stats = useMemo(() => computeStats(data, { days: 30 }), [data]);
  const hour = new Date().getHours();
  const hello = hour < 6 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const weekDelta = doneWeek.length - donePrevWeek.length;

  const toggleTask = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; t.status = t.done ? "done" : "todo"; pushAct(d, t.done ? "task.done" : "task.reopen", `Tâche « ${t.title} » ${t.done ? "terminée" : "rouverte"}`, { entity: "task", entityId: id, projectId: t.projectId }); } return d; });

  const [quickTitle, setQuickTitle] = useState("");
  const quickAdd = () => {
    const title = quickTitle.trim(); if (!title) return;
    update((d) => { const t = { id: uid(), title, notes: "", date: today, time: "", durationMin: 0, priority: 3, status: "todo", projectId: null, tags: [], subtasks: [], links: [], done: false, files: [], createdAt: Date.now(), updatedAt: Date.now() }; d.tasks.unshift(t); pushAct(d, "task.create", `Tâche « ${title} » créée`, { entity: "task", entityId: t.id }); return d; });
    setQuickTitle("");
  };
  const todayList = [...late, ...tToday].sort((a, b) => a.priority - b.priority);

  const TaskLine = ({ t, retard }) => (
    <div className="flex min-h-[44px] items-center gap-3.5 rounded-lg border border-border bg-secondary/40 px-4 py-2.5">
      <button onClick={() => toggleTask(t.id)} className={cn("grid h-5 w-5 flex-none place-items-center rounded-[6px] border transition-colors", t.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-foreground")}>{t.done && <Check size={12} strokeWidth={3} />}</button>
      <span className={cn("flex-1 truncate text-[15px]", t.done && "text-muted-foreground line-through")}>{t.title}</span>
      {retard && <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-[11.5px] font-semibold text-destructive">retard</span>}
      <span className="h-2 w-2 flex-none rounded-full" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
    </div>
  );

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-[24px] font-semibold tracking-tight">{hello}, {data.settings.userName} 👋</h2>
        <p className="mt-1.5 text-[14px] capitalize text-muted-foreground">{DOWS_L[(new Date().getDay() + 6) % 7]} {new Date().getDate()} {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-6 lg:col-span-3"><Stat label="Tâches aujourd'hui" value={tToday.length} /></div>
        <div className="col-span-6 lg:col-span-3"><Stat label="En retard" value={late.length} danger /></div>
        <div className="col-span-6 lg:col-span-3"><Stat label="Terminées (7 j)" value={doneWeek.length} delta={weekDelta !== 0 ? Math.abs(weekDelta) : null} deltaType={weekDelta >= 0 ? "up" : "down"} /></div>
        <div className="col-span-6 lg:col-span-3"><Stat label="Événements" value={evToday.length} /></div>

        <Card className="col-span-12 lg:col-span-5">
          <CardContent className="flex flex-1 flex-col px-6 py-6">
            <CardTitle className="mb-4">Aujourd'hui</CardTitle>
            {todayList.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-7 text-center text-[13px] text-muted-foreground"><CheckCircle2 size={22} />Rien pour aujourd'hui. Ajoute ta première tâche 👇</div>
            ) : (
              <div className="flex flex-col gap-2">{todayList.slice(0, 8).map((t) => <TaskLine key={t.id} t={t} retard={t.date < today} />)}</div>
            )}
            <div className="mt-3 flex min-h-[44px] items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-2.5">
              <Plus size={16} className="text-muted-foreground" />
              <input value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && quickAdd()} placeholder="Ajouter une tâche pour aujourd'hui…" className="flex-1 border-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" style={{ boxShadow: "none", padding: 0, width: "auto" }} />
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">↵</kbd>
            </div>
            <div className="flex-1" />
            {todayList.length <= 3 && (
              <div className="pt-6">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Raccourcis</div>
                <div className="flex flex-wrap gap-2.5">
                  <button onClick={() => goTo("tasks")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><ListChecks size={14} />Toutes les tâches</button>
                  {late.length > 0 && <button onClick={() => goTo("tasks")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-[13px] text-destructive transition-colors hover:bg-secondary"><Clock3 size={14} />{late.length} en retard</button>}
                  <button onClick={() => goTo("agenda")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><CalendarDays size={14} />Agenda</button>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-[13px] text-muted-foreground"><Command size={13} />K · recherche</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardContent className="px-6 py-6"><CardTitle className="mb-4">Calendrier</CardTitle>
            <MiniCalendar month={miniMonth} setMonth={setMiniMonth} selected={null} onSelect={(d) => { setSelectedDate(d); goTo("agenda"); }} itemsByDate={itemsByDate} />
          </CardContent>
        </Card>

        <div className="col-span-12 flex flex-col gap-5 lg:col-span-3">
          <Card>
            <CardContent className="px-6 py-6"><CardTitle className="mb-4">Activité · 30 j</CardTitle>
              <div className="font-mono text-[28px] font-semibold leading-none tabular-nums">{doneWeek.length}<span className="text-[14px] font-normal text-muted-foreground"> / 7 j</span></div>
              <div className="mt-4"><Sparkline points={stats.series.map((s) => s.done)} color="var(--foreground)" height={48} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-6 py-6"><CardTitle className="mb-4">Taux</CardTitle>
              <div className="font-mono text-[28px] font-semibold leading-none tabular-nums">{stats.completionRate}<span className="text-[15px] font-normal text-muted-foreground">%</span></div>
              <div className="mt-2.5 text-[12.5px] text-muted-foreground">{stats.doneTasks}/{stats.totalTasks} tâches terminées</div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-12 lg:col-span-8">
          <CardContent className="px-6 py-6">
            <CardTitle className="mb-4">Projets</CardTitle>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
              {data.projects.length === 0 && <p className="text-[13px] text-muted-foreground">Aucun projet.</p>}
              {data.projects.map((p) => {
                const pts = data.tasks.filter((t) => t.projectId === p.id); const done = pts.filter((t) => t.done).length;
                const pct = pts.length ? Math.round((done / pts.length) * 100) : 0;
                return (
                  <button key={p.id} onClick={() => goTo("projects")} className="lift rounded-xl border border-border bg-secondary/40 p-5 text-left hover:bg-secondary">
                    <div className="mb-3 flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-foreground" /><span className="text-[14.5px] font-semibold">{p.name}</span><span className="ml-auto font-mono text-[12px] font-semibold text-muted-foreground">{pct}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-accent"><div className="h-full rounded-full bg-foreground" style={{ width: pct + "%" }} /></div>
                    <div className="mt-2.5 text-[12.5px] text-muted-foreground">{done}/{pts.length} tâches terminées</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardContent className="flex flex-1 flex-col px-6 py-6">
            <CardTitle className="mb-4">Personal Brain</CardTitle>
            <div className="flex flex-col gap-2">
              {insights.length === 0 ? <p className="text-[13px] text-muted-foreground">Tout est sous contrôle.</p> : insights.slice(0, 4).map((ins, i) => {
                const Ic = INSIGHT_ICON[ins.icon] || Sparkles;
                return <button key={i} onClick={() => ins.action && goTo(ins.action.view)} className="flex min-h-[44px] items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-left text-[13.5px] transition-colors hover:bg-secondary"><Ic size={15} className={ins.tone === "rd" ? "text-destructive" : "text-muted-foreground"} /><span>{ins.text}</span></button>;
              })}
            </div>
            <div className="flex-1" />
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => goTo("brain")}>Ouvrir le Personal Brain <ArrowRight size={13} /></Button>
          </CardContent>
        </Card>

        <Card className="col-span-12">
          <CardContent className="px-6 py-6">
            <CardTitle className="mb-4">Prochains événements</CardTitle>
            {upcoming.length === 0 ? <p className="text-[13px] text-muted-foreground">Aucun événement à venir.</p>
              : <div className="flex flex-wrap gap-4">{upcoming.map((e) => (
                <div key={e.id} className="lift flex min-w-[250px] flex-1 items-center gap-4 rounded-xl border border-border bg-secondary/40 px-5 py-4">
                  <div className="w-11 flex-none text-center"><div className="font-mono text-[17px] font-semibold">{Number(e.date.slice(8, 10))}</div><div className="text-[10px] font-semibold uppercase text-muted-foreground">{MONTHS[Number(e.date.slice(5, 7)) - 1].slice(0, 3)}</div></div>
                  <div className="min-w-0"><div className="truncate text-[14px] font-semibold">{e.title}</div><div className="mt-1 text-[12.5px] text-muted-foreground">{e.allDay ? "Journée" : (e.start || "") + (e.end ? " – " + e.end : "")}{e.location ? " · " + e.location : ""}</div></div>
                </div>))}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
