import React, { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Download, TrendingUp } from "lucide-react";
import { computeStats, iso, dPlus, download, PRIOS, todayISO } from "../lib/core.js";
import { AreaChart, Donut, Bars, Heatmap } from "../components.jsx";

function KPI({ label, value, suffix, color, delta }) {
  return (
    <div className="card">
      <div className="stat-label" style={{ marginTop: 0, marginBottom: 8 }}>{label}</div>
      <div className="stat-num" style={color ? { color } : null}>{value}{suffix && <span style={{ fontSize: 15, color: "var(--t3)" }}> {suffix}</span>}</div>
      {delta != null && delta !== 0 && (
        <div className="delta" style={{ color: delta > 0 ? "var(--gn)" : "var(--rd)" }}>
          {delta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{delta > 0 ? "+" : ""}{delta} vs période préc.
        </div>
      )}
    </div>
  );
}

export default function DataView({ data, pushToast }) {
  const [days, setDays] = useState(30);
  const [projectId, setProjectId] = useState(null);
  const stats = useMemo(() => computeStats(data, { days, projectId }), [data, days, projectId]);

  const velocityDelta = useMemo(() => {
    const inRange = (ts, a, b) => { const k = iso(new Date(ts)); return k >= a && k <= b; };
    const t = projectId ? data.tasks.filter((x) => x.projectId === projectId) : data.tasks;
    const cur = t.filter((x) => x.done && x.doneAt && inRange(x.doneAt, dPlus(-6), todayISO())).length;
    const prev = t.filter((x) => x.done && x.doneAt && inRange(x.doneAt, dPlus(-13), dPlus(-7))).length;
    return cur - prev;
  }, [data, projectId]);

  const prioSeg = [
    { value: stats.byPriority[1], color: "var(--rd)", label: "Urgente" },
    { value: stats.byPriority[2], color: "var(--ac)", label: "Haute" },
    { value: stats.byPriority[3], color: "var(--t2b)", label: "Normale" },
    { value: stats.byPriority[4], color: "var(--t3)", label: "Basse" },
  ];
  const prioTotal = prioSeg.reduce((s, x) => s + x.value, 0) || 1;

  const exportCSV = () => {
    const rows = [["jour", "creees", "terminees"], ...stats.series.map((s) => [s.day, s.created, s.done])];
    download("tasks-data.csv", rows.map((r) => r.join(",")).join("\n"), "text/csv");
    pushToast("Données exportées (.csv)", "green");
  };

  return (
    <div>
      <div className="section-head">
        <div><h2>Data</h2><div className="hint" style={{ marginTop: 4 }}>Analytics en direct sur tes tâches.</div></div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <div className="segmented">
            {[[7, "7 j"], [30, "30 j"], [90, "90 j"]].map(([d, l]) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{l}</button>)}
          </div>
          <select style={{ width: 168 }} value={projectId || ""} onChange={(e) => setProjectId(e.target.value || null)}>
            <option value="">Tous les projets</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><Download size={13} /> Export</button>
        </div>
      </div>

      <div className="bento">
        <div className="span3"><KPI label="Taux de complétion" value={stats.completionRate} suffix="%" color="var(--acT)" /></div>
        <div className="span3"><KPI label="Vélocité / semaine" value={stats.velocityPerWeek} delta={velocityDelta} /></div>
        <div className="span3"><KPI label="En retard" value={stats.lateCount} color={stats.lateCount ? "var(--rd)" : null} /></div>
        <div className="span3"><KPI label="Délai moyen" value={stats.avgLeadDays} suffix="j" /></div>

        <div className="card span8">
          <div className="card-title">Productivité — créées vs terminées ({days} j)
            <span className="leg"><span><span className="sw" style={{ background: "var(--ac)" }} />Créées</span><span><span className="sw" style={{ background: "var(--acs)" }} />Terminées</span></span>
          </div>
          {stats.series.every((s) => !s.created && !s.done)
            ? <div className="empty"><TrendingUp size={22} />Pas encore assez d'activité sur cette période.</div>
            : <AreaChart series={stats.series} height={150} />}
        </div>

        <div className="card span4">
          <div className="card-title">Par priorité</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Donut segments={prioSeg} size={108} />
            <div className="leg" style={{ flexDirection: "column", gap: 8 }}>
              {prioSeg.map((s) => <span key={s.label}><span className="sw" style={{ background: s.color }} />{s.label} <span className="mono" style={{ color: "var(--t3)", marginLeft: 4 }}>{Math.round(s.value / prioTotal * 100)}%</span></span>)}
            </div>
          </div>
        </div>

        <div className="card span6">
          <div className="card-title">Par projet</div>
          {stats.byProject.length === 0 ? <div className="hint">Aucune tâche rattachée à un projet.</div>
            : <Bars items={stats.byProject.map((p) => ({ label: p.name, pct: p.pct, value: p.pct + "%", color: p.color }))} />}
        </div>

        <div className="card span6">
          <div className="card-title">Activité — 100 derniers jours</div>
          <Heatmap cells={stats.heatmap} max={stats.heatMax} />
          <div className="leg" style={{ marginTop: 12, justifyContent: "flex-end" }}>
            <span style={{ color: "var(--t3)" }}>moins</span>
            <span className="sw" style={{ background: "var(--surface3)" }} />
            <span className="sw" style={{ background: "color-mix(in srgb, var(--ac) 40%, var(--surface3))" }} />
            <span className="sw" style={{ background: "color-mix(in srgb, var(--ac) 75%, var(--surface3))" }} />
            <span className="sw" style={{ background: "var(--ac)" }} />
            <span style={{ color: "var(--t3)" }}>plus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
