import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard, CalendarDays, CheckSquare, FolderKanban, Users, Briefcase,
  Settings as SettingsIcon, Bell, Plus, X, Check, Trash2, Upload, FileText,
  Video, ChevronLeft, ChevronRight, ChevronDown, Clock, Paperclip, Download,
  Send, RefreshCw, GripVertical, Database, Share2, Mail, Phone, Search,
  CheckCircle2, AlertTriangle, Folder, Link2
} from "lucide-react";
import { kvGet, kvSet, kvDel, cloudEnabled } from "./storage";

/* ============================== STYLES ============================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root{
  --bg:#09090b; --surface:#121214; --surface2:#1a1a1e; --surface3:#222229;
  --border:#232329; --border2:#32323b;
  --text:#fafafa; --text2:#9b9ba4; --text3:#5c5c66;
  --blue:#0a66ff; --blue2:#3d86ff; --blue-soft:rgba(10,102,255,.13);
  --red:#ef4444; --red-soft:rgba(239,68,68,.12);
  --green:#22c55e; --green-soft:rgba(34,197,94,.13);
  --radius:16px; --radius-sm:10px;
}
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:#2a2a31;border-radius:8px;}
::-webkit-scrollbar-track{background:transparent;}
.tt-app{display:flex;height:100vh;width:100%;background:var(--bg);color:var(--text);
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;overflow:hidden;}
.tt-app a{color:var(--blue2);text-decoration:none;}
.tt-app a:hover{text-decoration:underline;}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
input,select,textarea{font-family:inherit;font-size:13px;color:var(--text);background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 12px;outline:none;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--blue);}
input::placeholder,textarea::placeholder{color:var(--text3);}

/* Sidebar */
.sidebar{width:228px;min-width:228px;border-right:1px solid var(--border);display:flex;flex-direction:column;
  padding:20px 12px;background:var(--surface);}
.logo{display:flex;align-items:center;gap:10px;padding:0 10px 22px;}
.logo-mark{width:30px;height:30px;border-radius:9px;background:var(--blue);display:flex;align-items:center;
  justify-content:center;font-weight:800;font-size:14px;color:#fff;}
.logo-name{font-weight:700;font-size:15px;letter-spacing:-.02em;}
.nav-item{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:var(--radius-sm);
  color:var(--text2);font-weight:500;font-size:13.5px;margin-bottom:2px;width:100%;text-align:left;transition:background .12s,color .12s;}
.nav-item:hover{background:var(--surface2);color:var(--text);}
.nav-item.active{background:var(--blue-soft);color:var(--blue2);font-weight:600;}
.sidebar-foot{margin-top:auto;padding:12px;border-top:1px solid var(--border);display:flex;align-items:center;
  gap:9px;color:var(--text3);font-size:11.5px;}
.sync-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex:none;}

/* Topbar + layout */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:58px;min-height:58px;border-bottom:1px solid var(--border);display:flex;align-items:center;
  justify-content:space-between;padding:0 24px;background:var(--surface);}
.topbar h1{font-size:15px;font-weight:700;letter-spacing:-.01em;}
.topbar-right{display:flex;align-items:center;gap:14px;position:relative;}
.avatar{width:32px;height:32px;border-radius:50%;background:var(--blue);display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:12px;color:#fff;}
.content{flex:1;overflow-y:auto;padding:24px;}

/* Cards & bento */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;}
.card-title{font-size:12px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;}
.span3{grid-column:span 3;} .span4{grid-column:span 4;} .span5{grid-column:span 5;}
.span6{grid-column:span 6;} .span7{grid-column:span 7;} .span8{grid-column:span 8;} .span12{grid-column:span 12;}
@media(max-width:1100px){.span3,.span4,.span5,.span6,.span7,.span8{grid-column:span 12;}}
.stat-num{font-size:30px;font-weight:800;letter-spacing:-.03em;line-height:1;}
.stat-label{font-size:12px;color:var(--text2);margin-top:7px;font-weight:500;}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;background:var(--blue);color:#fff;font-weight:600;
  font-size:13px;padding:9px 15px;border-radius:var(--radius-sm);transition:opacity .12s;white-space:nowrap;}
.btn:hover{opacity:.88;}
.btn-ghost{background:var(--surface2);color:var(--text);border:1px solid var(--border);}
.btn-ghost:hover{border-color:var(--border2);opacity:1;}
.btn-green{background:var(--green);} .btn-red{background:var(--red);}
.btn-sm{padding:6px 11px;font-size:12px;border-radius:8px;}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
  border-radius:8px;color:var(--text2);transition:background .12s,color .12s;flex:none;}
.icon-btn:hover{background:var(--surface3);color:var(--text);}
.icon-btn.red:hover{background:var(--red-soft);color:var(--red);}
.icon-btn.green:hover{background:var(--green-soft);color:var(--green);}

/* Checkbox */
.check{width:19px;height:19px;border-radius:6px;border:1.5px solid var(--border2);display:flex;align-items:center;
  justify-content:center;flex:none;transition:all .12s;color:transparent;}
.check:hover{border-color:var(--green);}
.check.on{background:var(--green);border-color:var(--green);color:#fff;}

/* Priority */
.prio{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;padding:3px 9px;
  border-radius:999px;background:var(--surface3);color:var(--text2);white-space:nowrap;}
.prio-dot{width:7px;height:7px;border-radius:50%;flex:none;}

/* Tasks */
.task-row{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid var(--border);
  border-radius:var(--radius-sm);background:var(--surface);margin-bottom:8px;transition:border-color .12s;}
.task-row:hover{border-color:var(--border2);}
.task-row.dragging{opacity:.4;}
.task-row.done .task-title{text-decoration:line-through;color:var(--text3);}
.task-title{font-weight:500;font-size:13.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.task-meta{display:flex;align-items:center;gap:8px;color:var(--text3);font-size:11.5px;flex:none;}
.task-expand{border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius-sm) var(--radius-sm);
  margin:-8px 0 8px;padding:14px;background:var(--surface);}
.grip{color:var(--text3);cursor:grab;flex:none;display:flex;}

/* Chips / tags */
.tag{font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--blue-soft);
  color:var(--blue2);white-space:nowrap;}
.file-chip{display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid var(--border);
  border-radius:var(--radius-sm);background:var(--surface2);font-size:12px;margin-bottom:6px;}
.file-chip .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}
.file-chip .size{color:var(--text3);font-size:11px;flex:none;}

/* Dropzone */
.dropzone{border:1.5px dashed var(--border2);border-radius:var(--radius-sm);padding:18px;display:flex;
  flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--text3);font-size:12.5px;
  cursor:pointer;transition:all .15s;text-align:center;}
.dropzone:hover{border-color:var(--text3);color:var(--text2);}
.dropzone.over{border-color:var(--blue);background:var(--blue-soft);color:var(--blue2);}

/* Mini calendar */
.mini-cal{user-select:none;}
.mini-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mini-head .m{font-weight:700;font-size:13px;text-transform:capitalize;}
.mini-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.mini-dow{font-size:9.5px;color:var(--text3);text-align:center;font-weight:600;padding-bottom:4px;}
.mini-day{position:relative;aspect-ratio:1;border-radius:8px;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;font-size:11px;color:var(--text2);cursor:pointer;transition:background .12s;}
.mini-day:hover{background:var(--surface3);color:var(--text);}
.mini-day.out{color:var(--text3);opacity:.35;}
.mini-day.today{color:var(--blue2);font-weight:700;}
.mini-day.sel{background:var(--blue);color:#fff;font-weight:700;}
.mini-dots{display:flex;gap:2px;height:4px;}
.mini-dots i{width:4px;height:4px;border-radius:50%;display:block;}
.mini-tip{position:absolute;z-index:60;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);
  width:212px;background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-sm);
  padding:10px 11px;box-shadow:0 12px 32px rgba(0,0,0,.55);text-align:left;cursor:default;}
.mini-tip .d{font-size:10.5px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px;}
.mini-tip .it{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text);padding:2.5px 0;}
.mini-tip .it span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mini-tip .more{font-size:10.5px;color:var(--text3);margin-top:4px;}

/* Big calendar */
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.cal-head .m{font-size:16px;font-weight:700;text-transform:capitalize;letter-spacing:-.01em;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}
.cal-dow{font-size:10.5px;color:var(--text3);font-weight:600;text-align:center;padding:4px 0;text-transform:uppercase;letter-spacing:.05em;}
.cal-cell{min-height:96px;border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px;
  cursor:pointer;transition:border-color .12s,background .12s;background:var(--surface);overflow:hidden;}
.cal-cell:hover{border-color:var(--border2);}
.cal-cell.out{opacity:.4;}
.cal-cell.sel{border-color:var(--blue);background:var(--blue-soft);}
.cal-num{font-size:11.5px;font-weight:600;color:var(--text2);margin-bottom:5px;}
.cal-cell.today .cal-num{color:var(--blue2);font-weight:800;}
.cal-chip{font-size:10.5px;font-weight:500;padding:2.5px 7px;border-radius:6px;margin-bottom:3px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:5px;}
.cal-chip.ev{background:var(--blue-soft);color:var(--blue2);}
.cal-chip.tk{background:var(--surface3);color:var(--text2);}
.cal-chip .pd{width:5px;height:5px;border-radius:50%;flex:none;}
.cal-more{font-size:10px;color:var(--text3);font-weight:600;}

/* Modal */
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;
  z-index:100;backdrop-filter:blur(3px);}
.modal{width:440px;max-width:92vw;max-height:86vh;overflow-y:auto;background:var(--surface);
  border:1px solid var(--border2);border-radius:var(--radius);padding:22px;}
.modal h3{font-size:15px;font-weight:700;letter-spacing:-.01em;}
.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.field{margin-bottom:13px;}
.field label{display:block;font-size:11.5px;font-weight:600;color:var(--text2);margin-bottom:6px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}

/* Toasts */
.toasts{position:fixed;bottom:20px;right:20px;z-index:200;display:flex;flex-direction:column;gap:8px;}
.toast{background:var(--surface3);border:1px solid var(--border2);border-left:3px solid var(--blue);
  border-radius:var(--radius-sm);padding:11px 15px;font-size:12.5px;font-weight:500;max-width:330px;
  box-shadow:0 10px 28px rgba(0,0,0,.5);animation:tin .18s ease;}
.toast.green{border-left-color:var(--green);} .toast.red{border-left-color:var(--red);}
@keyframes tin{from{transform:translateY(8px);opacity:0;}to{transform:none;opacity:1;}}
.spin{animation:rot 1.1s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
@media(prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important;}}

/* Notifications dropdown */
.notif-pop{position:absolute;top:44px;right:0;width:308px;background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--radius);padding:12px;z-index:90;box-shadow:0 16px 40px rgba(0,0,0,.55);}
.notif-item{padding:9px 10px;border-radius:8px;font-size:12.5px;color:var(--text);background:var(--surface2);margin-bottom:6px;}
.notif-item .t{color:var(--text3);font-size:10.5px;margin-top:3px;}
.badge{position:absolute;top:-4px;right:-4px;min-width:15px;height:15px;border-radius:8px;background:var(--red);
  color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}

/* Chat */
.chat-wrap{display:flex;flex-direction:column;height:100%;min-height:0;}
.chat-scroll{flex:1;overflow-y:auto;padding:4px 2px;min-height:0;}
.msg{max-width:72%;margin-bottom:10px;}
.msg .b{padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.45;word-break:break-word;}
.msg.me{margin-left:auto;} .msg.me .b{background:var(--blue);color:#fff;border-bottom-right-radius:5px;}
.msg.me .b a{color:#cfe1ff;}
.msg.them .b{background:var(--surface3);border-bottom-left-radius:5px;}
.msg .who{font-size:10.5px;color:var(--text3);margin:0 4px 3px;font-weight:600;}
.msg.me .who{text-align:right;}
.chat-bar{display:flex;gap:8px;padding-top:12px;border-top:1px solid var(--border);align-items:center;}

/* CRM */
.crm-board{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:start;}
@media(max-width:1100px){.crm-board{grid-template-columns:repeat(2,1fr);}}
.crm-col{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:13px;min-height:230px;}
.crm-col.over{border-color:var(--blue);background:var(--blue-soft);}
.crm-col-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
.crm-col-head .n{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text2);}
.crm-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:12px;margin-bottom:9px;cursor:grab;transition:border-color .12s;}
.crm-card:hover{border-color:var(--border2);}
.crm-card .nm{font-weight:600;font-size:13px;margin-bottom:2px;}
.crm-card .co{color:var(--text2);font-size:11.5px;}
.crm-card .val{color:var(--blue2);font-weight:700;font-size:12px;margin-top:7px;}

/* Tabs */
.tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;}
.tab{padding:7px 14px;border-radius:999px;font-size:12.5px;font-weight:600;color:var(--text2);
  background:var(--surface2);border:1px solid var(--border);transition:all .12s;}
.tab:hover{color:var(--text);}
.tab.on{background:var(--blue-soft);color:var(--blue2);border-color:transparent;}

/* Projects */
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;}
.progress{height:5px;border-radius:99px;background:var(--surface3);overflow:hidden;}
.progress i{display:block;height:100%;background:var(--blue);border-radius:99px;transition:width .3s;}

.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;
  color:var(--text3);padding:38px 16px;text-align:center;font-size:13px;}
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}
.section-head h2{font-size:17px;font-weight:800;letter-spacing:-.02em;}
.hint{font-size:12px;color:var(--text3);line-height:1.55;}
.divider{height:1px;background:var(--border);margin:14px 0;}
.status-dot{width:8px;height:8px;border-radius:50%;flex:none;}

@media(max-width:880px){
  .sidebar{width:64px;min-width:64px;padding:16px 8px;}
  .logo-name,.nav-item span,.sidebar-foot span{display:none;}
  .nav-item{justify-content:center;}
  .logo{justify-content:center;padding-bottom:18px;}
}
`;

/* ============================== UTILS ============================== */

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => iso(new Date());
const dPlus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const DOWS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const DOWS_L = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const PRIOS = {
  1: { label: "Urgente", color: "var(--red)" },
  2: { label: "Haute", color: "var(--blue)" },
  3: { label: "Normale", color: "#8a8a94" },
  4: { label: "Basse", color: "#4a4a53" },
};

function fmtNice(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOWS_L[(dt.getDay() + 6) % 7]}. ${d} ${MONTHS[m - 1].slice(0, 4)}.`;
}
function fmtSize(b) {
  if (b == null) return "";
  if (b < 1024) return b + " o";
  if (b < 1048576) return (b / 1024).toFixed(0) + " Ko";
  return (b / 1048576).toFixed(1) + " Mo";
}
function fmtTime(ts) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function linkify(text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p)
      ? <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

/* Storage : Supabase si configuré (cloud multi-appareils), sinon localStorage — voir src/storage.js */
const sGet = (key, _shared = false) => kvGet(key);
const sSet = (key, value, _shared = false) => kvSet(key, value);
const sDel = (key, _shared = false) => kvDel(key);

/* Codes de synchronisation : identifient tes données perso et l'espace partagé dans le cloud */
function getPersonalCode() {
  let c = localStorage.getItem("tt:code");
  if (!c) {
    c = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
    localStorage.setItem("tt:code", c);
  }
  return c;
}
function getSpaceCode() {
  const fromUrl = new URLSearchParams(window.location.search).get("space");
  if (fromUrl) { localStorage.setItem("tt:space", fromUrl); return fromUrl; }
  let c = localStorage.getItem("tt:space");
  if (!c) {
    c = "equipe-" + Math.random().toString(36).slice(2, 7);
    localStorage.setItem("tt:space", c);
  }
  return c;
}
function inviteUrl() {
  return `${window.location.origin}${window.location.pathname}?space=${encodeURIComponent(getSpaceCode())}`;
}

function readFiles(list) {
  return Promise.all(Array.from(list).map((f) => new Promise((res) => {
    const base = { id: uid(), name: f.name, size: f.size, type: f.type, ts: Date.now(), content: null };
    if (f.size < 1500000) {
      const r = new FileReader();
      r.onload = () => res({ ...base, content: r.result });
      r.onerror = () => res(base);
      r.readAsDataURL(f);
    } else res(base);
  })));
}
function download(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

/* ICS import / export (compatible Google Calendar & Apple Calendar) */
function parseICS(text) {
  const events = [];
  const blocks = String(text).split("BEGIN:VEVENT").slice(1);
  for (const b of blocks) {
    const body = b.split("END:VEVENT")[0];
    const get = (prop) => {
      const m = body.match(new RegExp("^" + prop + "[^:\\r\\n]*:(.*)$", "m"));
      return m ? m[1].trim() : null;
    };
    const dtstart = get("DTSTART");
    if (!dtstart) continue;
    const d = dtstart.replace(/[^0-9T]/g, "");
    if (d.length < 8) continue;
    const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    let start = null, end = null;
    if (d.includes("T")) start = `${d.slice(9, 11)}:${d.slice(11, 13)}`;
    const dtend = get("DTEND");
    if (dtend) {
      const e = dtend.replace(/[^0-9T]/g, "");
      if (e.includes("T")) end = `${e.slice(9, 11)}:${e.slice(11, 13)}`;
    }
    events.push({
      id: uid(), title: (get("SUMMARY") || "Événement").replace(/\\,/g, ","),
      date, start, end, location: get("LOCATION") || "", source: "ics",
    });
  }
  return events;
}
function buildICS(events, tasks) {
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tasks Tracker//FR"];
  const stamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  events.forEach((e) => {
    const d = e.date.replace(/-/g, "");
    L.push("BEGIN:VEVENT", `UID:${e.id}@taskstracker`, `DTSTAMP:${stamp}`);
    if (e.start) L.push(`DTSTART:${d}T${e.start.replace(":", "")}00`);
    else L.push(`DTSTART;VALUE=DATE:${d}`);
    if (e.end) L.push(`DTEND:${d}T${e.end.replace(":", "")}00`);
    L.push(`SUMMARY:${e.title}`);
    if (e.location) L.push(`LOCATION:${e.location}`);
    L.push("END:VEVENT");
  });
  tasks.filter((t) => t.date && !t.done).forEach((t) => {
    const d = t.date.replace(/-/g, "");
    L.push("BEGIN:VEVENT", `UID:${t.id}@taskstracker`, `DTSTAMP:${stamp}`);
    if (t.time) L.push(`DTSTART:${d}T${t.time.replace(":", "")}00`);
    else L.push(`DTSTART;VALUE=DATE:${d}`);
    L.push(`SUMMARY:[Tâche] ${t.title}`, "END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

/* ============================== SEED ============================== */

const SEED = {
  v: 1,
  tasks: [
    { id: "t1", title: "Finaliser le contrat Valentin Parisot", notes: "Vérifier les clauses BlueCrest + option equity.", date: todayISO(), time: "14:00", priority: 1, projectId: "p1", done: false, files: [], createdAt: Date.now() },
    { id: "t2", title: "Préparer le deck investisseur pré-seed", notes: "", date: todayISO(), time: "", priority: 2, projectId: "p1", done: false, files: [], createdAt: Date.now() },
    { id: "t3", title: "Réviser Customer Experience (ECNU)", notes: "", date: dPlus(1), time: "", priority: 3, projectId: null, done: false, files: [], createdAt: Date.now() },
  ],
  events: [
    { id: "e1", title: "Call Léo — roadmap Watchpoint", date: todayISO(), start: "18:00", end: "19:00", location: "Google Meet", source: "local" },
  ],
  projects: [
    { id: "p1", name: "Watchpoint", color: "#0a66ff", desc: "Market intelligence — montres de luxe", files: [] },
  ],
  contacts: [
    { id: "c1", name: "Anthony Broto", company: "Investisseur pré-seed", email: "", phone: "", stage: "Proposition", value: 10000, notes: "5% via augmentation de capital réservée + BSA." },
  ],
  settings: { userName: "Louis", remindersOn: true, reminderMinutes: 30, googleImported: false, appleImported: false },
};
const SHARED_DEFAULT = { members: [], messages: [], tasks: [], files: [] };
const SHARED_KEY = "tt:shared:" + getSpaceCode();
const DATA_KEY = "tt:data:" + getPersonalCode();

/* ============================== COMPOSANTS GÉNÉRIQUES ============================== */

function Modal({ title, onClose, children, width }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" style={width ? { width } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn red" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrioPill({ p, onClick }) {
  const pr = PRIOS[p] || PRIOS[3];
  return (
    <button className="prio" onClick={onClick} title="Changer la priorité">
      <span className="prio-dot" style={{ background: pr.color }} />{pr.label}
    </button>
  );
}

function DropZone({ onFiles, label = "Glisse-dépose tes fichiers ici, ou clique", compact }) {
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  return (
    <div
      className={"dropzone" + (over ? " over" : "")}
      style={compact ? { padding: 11, flexDirection: "row" } : null}
      onClick={() => ref.current && ref.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={async (e) => {
        e.preventDefault(); setOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length) onFiles(await readFiles(e.dataTransfer.files));
      }}
    >
      <Upload size={compact ? 14 : 18} />
      <span>{label}</span>
      <input ref={ref} type="file" multiple style={{ display: "none" }}
        onChange={async (e) => { if (e.target.files.length) { onFiles(await readFiles(e.target.files)); e.target.value = ""; } }} />
    </div>
  );
}

function FileChip({ f, onRemove }) {
  return (
    <div className="file-chip">
      <FileText size={14} style={{ color: "var(--blue2)", flex: "none" }} />
      <span className="name">{f.name}</span>
      <span className="size">{fmtSize(f.size)}</span>
      {f.content ? (
        <a href={f.content} download={f.name} className="icon-btn" style={{ width: 26, height: 26 }} title="Télécharger">
          <Download size={13} />
        </a>
      ) : (
        <span className="size" title="Fichier > 1,5 Mo : métadonnées uniquement">méta</span>
      )}
      {onRemove && <button className="icon-btn red" style={{ width: 26, height: 26 }} onClick={onRemove}><X size={13} /></button>}
    </div>
  );
}

/* Mini calendrier interactif (points + overview au survol) */
function MiniCalendar({ month, setMonth, selected, onSelect, itemsByDate }) {
  const [hover, setHover] = useState(null);
  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const dimPrev = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - offset + 1;
    let date, out = false;
    if (dayNum < 1) { out = true; date = iso(new Date(y, m - 1, dimPrev + dayNum)); }
    else if (dayNum > dim) { out = true; date = iso(new Date(y, m + 1, dayNum - dim)); }
    else date = iso(new Date(y, m, dayNum));
    cells.push({ date, num: Number(date.slice(8, 10)), out });
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
          if (items.some((it) => it.type === "event")) dots.push("var(--blue)");
          if (items.some((it) => it.type === "task" && it.priority === 1)) dots.push("var(--red)");
          if (items.some((it) => it.type === "task" && it.priority !== 1)) dots.push("#8a8a94");
          return (
            <div
              key={i}
              className={"mini-day" + (c.out ? " out" : "") + (c.date === today ? " today" : "") + (c.date === selected ? " sel" : "")}
              onClick={() => onSelect && onSelect(c.date)}
              onMouseEnter={() => setHover(c.date)}
              onMouseLeave={() => setHover(null)}
            >
              <span>{c.num}</span>
              <span className="mini-dots">{dots.slice(0, 3).map((col, j) => <i key={j} style={{ background: col }} />)}</span>
              {hover === c.date && items.length > 0 && (
                <div className="mini-tip">
                  <div className="d">{fmtNice(c.date)} · {items.length} élément{items.length > 1 ? "s" : ""}</div>
                  {items.slice(0, 4).map((it, j) => (
                    <div key={j} className="it">
                      <span className="prio-dot" style={{ background: it.type === "event" ? "var(--blue)" : (PRIOS[it.priority] || PRIOS[3]).color, flex: "none" }} />
                      <span>{it.time ? it.time + " · " : ""}{it.title}</span>
                    </div>
                  ))}
                  {items.length > 4 && <div className="more">+ {items.length - 4} autre{items.length - 4 > 1 ? "s" : ""}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function Dashboard({ data, update, itemsByDate, goTo, setSelectedDate }) {
  const [miniMonth, setMiniMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = todayISO();
  const tToday = data.tasks.filter((t) => t.date === today && !t.done);
  const late = data.tasks.filter((t) => t.date && t.date < today && !t.done);
  const weekAgo = dPlus(-7);
  const doneWeek = data.tasks.filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) >= weekAgo);
  const evToday = data.events.filter((e) => e.date === today);
  const upcoming = data.events.filter((e) => e.date >= today).sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || ""))).slice(0, 5);
  const hour = new Date().getHours();
  const hello = hour < 6 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const toggleTask = (id) => update((d) => {
    const t = d.tasks.find((x) => x.id === id);
    if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; }
    return d;
  });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.02em" }}>{hello}, {data.settings.userName} 👋</div>
        <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4, textTransform: "capitalize" }}>
          {DOWS_L[(new Date().getDay() + 6) % 7]} {new Date().getDate()} {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}
        </div>
      </div>

      <div className="bento">
        <div className="card span3"><div className="stat-num" style={{ color: "var(--blue2)" }}>{tToday.length}</div><div className="stat-label">Tâches aujourd'hui</div></div>
        <div className="card span3"><div className="stat-num" style={{ color: late.length ? "var(--red)" : "var(--text)" }}>{late.length}</div><div className="stat-label">En retard</div></div>
        <div className="card span3"><div className="stat-num" style={{ color: "var(--green)" }}>{doneWeek.length}</div><div className="stat-label">Terminées (7 j)</div></div>
        <div className="card span3"><div className="stat-num">{evToday.length}</div><div className="stat-label">Événements aujourd'hui</div></div>

        <div className="card span5">
          <div className="card-title">Aujourd'hui</div>
          {tToday.length === 0 && late.length === 0 ? (
            <div className="empty"><CheckCircle2 size={22} style={{ color: "var(--green)" }} />Tout est à jour. Ajoute une tâche depuis l'onglet Tâches.</div>
          ) : (
            [...late, ...tToday].sort((a, b) => a.priority - b.priority).slice(0, 6).map((t) => (
              <div key={t.id} className="task-row" style={{ padding: "9px 11px" }}>
                <button className={"check" + (t.done ? " on" : "")} onClick={() => toggleTask(t.id)}><Check size={12} strokeWidth={3} /></button>
                <span className="task-title">{t.title}</span>
                {t.date < today && <span className="tag" style={{ background: "var(--red-soft)", color: "var(--red)" }}>retard</span>}
                <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
              </div>
            ))
          )}
        </div>

        <div className="card span3">
          <div className="card-title">Calendrier</div>
          <MiniCalendar month={miniMonth} setMonth={setMiniMonth} selected={null}
            onSelect={(d) => { setSelectedDate(d); goTo("agenda"); }} itemsByDate={itemsByDate} />
        </div>

        <div className="card span4">
          <div className="card-title">Prochains événements</div>
          {upcoming.length === 0 ? (
            <div className="empty"><CalendarDays size={22} />Aucun événement à venir.</div>
          ) : upcoming.map((e) => (
            <div key={e.id} style={{ display: "flex", gap: 11, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 40, textAlign: "center", flex: "none" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--blue2)" }}>{Number(e.date.slice(8, 10))}</div>
                <div style={{ fontSize: 9.5, color: "var(--text3)", textTransform: "uppercase", fontWeight: 700 }}>{MONTHS[Number(e.date.slice(5, 7)) - 1].slice(0, 3)}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{e.start ? e.start + (e.end ? " – " + e.end : "") : "Journée"}{e.location ? " · " + e.location : ""}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card span12">
          <div className="card-title">Projets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
            {data.projects.length === 0 && <div className="hint">Aucun projet — crée-en un dans l'onglet Projets.</div>}
            {data.projects.map((p) => {
              const pts = data.tasks.filter((t) => t.projectId === p.id);
              const done = pts.filter((t) => t.done).length;
              const pct = pts.length ? Math.round((done / pts.length) * 100) : 0;
              return (
                <div key={p.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: 13, cursor: "pointer" }} onClick={() => goTo("projects")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                    <span className="prio-dot" style={{ background: p.color, width: 9, height: 9 }} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="progress"><i style={{ width: pct + "%" }} /></div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 7 }}>{done}/{pts.length} tâches terminées</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== AGENDA ============================== */

function Agenda({ data, update, itemsByDate, pushToast, selectedDate, setSelectedDate }) {
  const [month, setMonth] = useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [evModal, setEvModal] = useState(null);
  const sel = selectedDate || todayISO();
  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < (offset + dim > 35 ? 42 : 35); i++) {
    const dn = i - offset + 1;
    const dt = new Date(y, m, dn);
    cells.push({ date: iso(dt), num: dt.getDate(), out: dn < 1 || dn > dim });
  }
  const today = todayISO();
  const dayEvents = data.events.filter((e) => e.date === sel).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const dayTasks = data.tasks.filter((t) => t.date === sel).sort((a, b) => a.priority - b.priority);

  const saveEvent = (ev) => {
    update((d) => {
      if (ev.id) { const i = d.events.findIndex((x) => x.id === ev.id); if (i >= 0) d.events[i] = ev; }
      else d.events.push({ ...ev, id: uid(), source: "local" });
      return d;
    });
    setEvModal(null);
    pushToast("Événement enregistré", "green");
  };
  const delEvent = (id) => update((d) => { d.events = d.events.filter((e) => e.id !== id); return d; });
  const toggleTask = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; } return d; });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "272px 1fr", gap: 18, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <MiniCalendar month={month} setMonth={setMonth} selected={sel} onSelect={setSelectedDate} itemsByDate={itemsByDate} />
        </div>
        <div className="card">
          <div className="card-title">{fmtNice(sel)}</div>
          {dayEvents.length === 0 && dayTasks.length === 0 && (
            <div className="empty" style={{ padding: "22px 8px" }}><Clock size={20} />Rien de prévu ce jour-là.</div>
          )}
          {dayEvents.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", background: "var(--blue-soft)", borderRadius: 10, marginBottom: 7 }}>
              <CalendarDays size={14} style={{ color: "var(--blue2)", flex: "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{e.start ? e.start + (e.end ? " – " + e.end : "") : "Journée"}{e.location ? " · " + e.location : ""}</div>
              </div>
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setEvModal(e)}><ChevronRight size={13} /></button>
              <button className="icon-btn red" style={{ width: 26, height: 26 }} onClick={() => delEvent(e.id)}><X size={13} /></button>
            </div>
          ))}
          {dayTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 4px" }}>
              <button className={"check" + (t.done ? " on" : "")} style={{ width: 17, height: 17 }} onClick={() => toggleTask(t.id)}><Check size={11} strokeWidth={3} /></button>
              <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--text3)" : "var(--text)" }}>{t.title}</span>
              <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
            onClick={() => setEvModal({ title: "", date: sel, start: "", end: "", location: "" })}>
            <Plus size={13} /> Ajouter un événement
          </button>
        </div>
      </div>

      <div className="card">
        <div className="cal-head">
          <span className="m">{MONTHS[m]} {y}</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setSelectedDate(todayISO()); }}>Aujourd'hui</button>
            <button className="icon-btn" onClick={() => setMonth(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
            <button className="icon-btn" onClick={() => setMonth(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
            <button className="btn btn-sm" onClick={() => setEvModal({ title: "", date: sel, start: "", end: "", location: "" })}><Plus size={13} /> Événement</button>
          </span>
        </div>
        <div className="cal-grid" style={{ marginBottom: 6 }}>
          {DOWS_L.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((c, i) => {
            const items = itemsByDate[c.date] || [];
            const evs = items.filter((x) => x.type === "event");
            const tks = items.filter((x) => x.type === "task");
            const shown = [...evs, ...tks].slice(0, 3);
            return (
              <div key={i} className={"cal-cell" + (c.out ? " out" : "") + (c.date === today ? " today" : "") + (c.date === sel ? " sel" : "")}
                onClick={() => setSelectedDate(c.date)}>
                <div className="cal-num">{c.num}</div>
                {shown.map((it, j) => (
                  <div key={j} className={"cal-chip " + (it.type === "event" ? "ev" : "tk")}>
                    {it.type === "task" && <span className="pd" style={{ background: (PRIOS[it.priority] || PRIOS[3]).color }} />}
                    {it.time ? it.time + " " : ""}{it.title}
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
          <EventForm ev={evModal} onSave={saveEvent} />
        </Modal>
      )}
    </div>
  );
}

function EventForm({ ev, onSave }) {
  const [f, setF] = useState(ev);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <div>
      <div className="field"><label>Titre</label><input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Call investisseur" autoFocus /></div>
      <div className="field"><label>Date</label><input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></div>
      <div className="row2">
        <div className="field"><label>Début</label><input type="time" value={f.start || ""} onChange={(e) => set("start", e.target.value)} /></div>
        <div className="field"><label>Fin</label><input type="time" value={f.end || ""} onChange={(e) => set("end", e.target.value)} /></div>
      </div>
      <div className="field"><label>Lieu / lien</label><input value={f.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Google Meet, bureau…" /></div>
      <button className="btn btn-green" style={{ width: "100%", justifyContent: "center" }} disabled={!f.title.trim() || !f.date}
        onClick={() => onSave(f)}><Check size={14} /> Enregistrer</button>
    </div>
  );
}

/* ============================== TÂCHES ============================== */

function Tasks({ data, update, pushToast }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("");
  const [prio, setPrio] = useState(3);
  const [proj, setProj] = useState("");
  const [filter, setFilter] = useState("active");
  const [sortMode, setSortMode] = useState("manual");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const dragId = useRef(null);

  const add = () => {
    if (!title.trim()) return;
    update((d) => {
      d.tasks.unshift({ id: uid(), title: title.trim(), notes: "", date, time, priority: prio, projectId: proj || null, done: false, files: [], createdAt: Date.now() });
      return d;
    });
    setTitle(""); setTime("");
    pushToast("Tâche ajoutée", "green");
  };

  const toggle = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; } return d; });
  const remove = (id) => { update((d) => { d.tasks = d.tasks.filter((t) => t.id !== id); return d; }); pushToast("Tâche supprimée", "red"); };
  const cyclePrio = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) t.priority = t.priority >= 4 ? 1 : t.priority + 1; return d; });
  const setNotes = (id, v) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) t.notes = v; return d; });
  const addFiles = (id, fs) => { update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) t.files = [...(t.files || []), ...fs]; return d; }); pushToast(`${fs.length} fichier(s) joint(s)`, "green"); };
  const rmFile = (id, fid) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) t.files = t.files.filter((f) => f.id !== fid); return d; });

  const onDrop = (targetId) => {
    const src = dragId.current;
    if (!src || src === targetId) return;
    update((d) => {
      const from = d.tasks.findIndex((t) => t.id === src);
      const to = d.tasks.findIndex((t) => t.id === targetId);
      if (from < 0 || to < 0) return d;
      const [mv] = d.tasks.splice(from, 1);
      d.tasks.splice(to, 0, mv);
      return d;
    });
  };

  const today = todayISO();
  let list = data.tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "active") return !t.done;
    if (filter === "today") return !t.done && t.date === today;
    if (filter === "late") return !t.done && t.date && t.date < today;
    if (filter === "done") return t.done;
    return true;
  });
  if (sortMode === "priority") list = [...list].sort((a, b) => a.priority - b.priority);
  if (sortMode === "date") list = [...list].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  const projName = (id) => (data.projects.find((p) => p.id === id) || {}).name;

  return (
    <div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
          <input style={{ flex: "2 1 220px" }} placeholder="Nouvelle tâche…" value={title}
            onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <input type="date" style={{ width: 148 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" style={{ width: 110 }} value={time} onChange={(e) => setTime(e.target.value)} />
          <select style={{ width: 128 }} value={prio} onChange={(e) => setPrio(Number(e.target.value))}>
            {Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select style={{ width: 150 }} value={proj} onChange={(e) => setProj(e.target.value)}>
            <option value="">Sans projet</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn" onClick={add}><Plus size={14} /> Ajouter</button>
        </div>
      </div>

      <div className="section-head">
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[["active", "À faire"], ["today", "Aujourd'hui"], ["late", "En retard"], ["done", "Terminées"], ["all", "Toutes"]].map(([k, l]) => (
            <button key={k} className={"tab" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "var(--text3)" }} />
            <input style={{ width: 180, paddingLeft: 30 }} placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select style={{ width: 158 }} value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="manual">Ordre manuel</option>
            <option value="priority">Par priorité</option>
            <option value="date">Par date</option>
          </select>
        </div>
      </div>

      {list.length === 0 && <div className="card"><div className="empty"><CheckSquare size={22} />Aucune tâche ici. Ajoute-en une ci-dessus.</div></div>}

      {list.map((t) => (
        <div key={t.id}>
          <div className={"task-row" + (t.done ? " done" : "")}
            draggable={sortMode === "manual"}
            onDragStart={() => { dragId.current = t.id; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onDrop(t.id); }}
            style={openId === t.id ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null}>
            {sortMode === "manual" && <span className="grip"><GripVertical size={14} /></span>}
            <button className={"check" + (t.done ? " on" : "")} onClick={() => toggle(t.id)}><Check size={12} strokeWidth={3} /></button>
            <span className="task-title">{t.title}</span>
            {t.projectId && projName(t.projectId) && <span className="tag">{projName(t.projectId)}</span>}
            {(t.files || []).length > 0 && (
              <span className="task-meta"><Paperclip size={12} />{t.files.length}</span>
            )}
            {t.date && <span className="task-meta" style={!t.done && t.date < today ? { color: "var(--red)" } : null}><Clock size={12} />{fmtNice(t.date)}{t.time ? " " + t.time : ""}</span>}
            <PrioPill p={t.priority} onClick={() => cyclePrio(t.id)} />
            <button className="icon-btn" onClick={() => setOpenId(openId === t.id ? null : t.id)} title="Notes & fichiers">
              <ChevronDown size={14} style={{ transform: openId === t.id ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            <button className="icon-btn red" onClick={() => remove(t.id)}><X size={14} /></button>
          </div>
          {openId === t.id && (
            <div className="task-expand">
              <div className="field"><label>Notes</label>
                <textarea rows={2} value={t.notes || ""} onChange={(e) => setNotes(t.id, e.target.value)} placeholder="Détails, contexte…" />
              </div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>Fichiers joints</label>
              {(t.files || []).map((f) => <FileChip key={f.id} f={f} onRemove={() => rmFile(t.id, f.id)} />)}
              <DropZone compact onFiles={(fs) => addFiles(t.id, fs)} label="Glisse-dépose un fichier sur cette tâche" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================== PROJETS ============================== */

const PALETTE = ["#0a66ff", "#22c55e", "#ef4444", "#f59e0b", "#a855f7", "#14b8a6", "#ec4899", "#8a8a94"];

function Projects({ data, update, pushToast }) {
  const [modal, setModal] = useState(null);

  const save = (p) => {
    update((d) => {
      if (p.id) { const i = d.projects.findIndex((x) => x.id === p.id); if (i >= 0) d.projects[i] = { ...d.projects[i], ...p }; }
      else d.projects.push({ ...p, id: uid(), files: [] });
      return d;
    });
    setModal(null);
    pushToast("Projet enregistré", "green");
  };
  const remove = (id) => {
    update((d) => {
      d.projects = d.projects.filter((p) => p.id !== id);
      d.tasks.forEach((t) => { if (t.projectId === id) t.projectId = null; });
      return d;
    });
    pushToast("Projet supprimé", "red");
  };
  const addFiles = (id, fs) => { update((d) => { const p = d.projects.find((x) => x.id === id); if (p) p.files = [...(p.files || []), ...fs]; return d; }); pushToast(`${fs.length} fichier(s) ajouté(s) au projet`, "green"); };
  const rmFile = (id, fid) => update((d) => { const p = d.projects.find((x) => x.id === id); if (p) p.files = p.files.filter((f) => f.id !== fid); return d; });
  const toggle = (id) => update((d) => { const t = d.tasks.find((x) => x.id === id); if (t) { t.done = !t.done; t.doneAt = t.done ? Date.now() : null; } return d; });

  return (
    <div>
      <div className="section-head">
        <h2>Projets</h2>
        <button className="btn" onClick={() => setModal({ name: "", desc: "", color: PALETTE[0] })}><Plus size={14} /> Nouveau projet</button>
      </div>
      {data.projects.length === 0 && <div className="card"><div className="empty"><FolderKanban size={22} />Crée ton premier projet pour organiser tes tâches et fichiers.</div></div>}
      <div className="proj-grid">
        {data.projects.map((p) => {
          const pts = data.tasks.filter((t) => t.projectId === p.id);
          const done = pts.filter((t) => t.done).length;
          const pct = pts.length ? Math.round((done / pts.length) * 100) : 0;
          return (
            <div key={p.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <span className="prio-dot" style={{ background: p.color, width: 10, height: 10 }} />
                <span style={{ fontWeight: 800, fontSize: 14.5, flex: 1 }}>{p.name}</span>
                <button className="icon-btn" onClick={() => setModal(p)} title="Modifier"><ChevronRight size={14} /></button>
                <button className="icon-btn red" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
              </div>
              {p.desc && <div className="hint" style={{ marginBottom: 10 }}>{p.desc}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "8px 0 14px" }}>
                <div className="progress" style={{ flex: 1 }}><i style={{ width: pct + "%", background: p.color }} /></div>
                <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700 }}>{done}/{pts.length}</span>
              </div>
              {pts.slice(0, 4).map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <button className={"check" + (t.done ? " on" : "")} style={{ width: 16, height: 16 }} onClick={() => toggle(t.id)}><Check size={10} strokeWidth={3} /></button>
                  <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--text3)" : "var(--text)" }}>{t.title}</span>
                  <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
                </div>
              ))}
              {pts.length > 4 && <div className="hint" style={{ padding: "3px 0 6px" }}>+ {pts.length - 4} autres tâches</div>}
              <div className="divider" />
              <div className="card-title" style={{ marginBottom: 9 }}>Dropbox du projet</div>
              {(p.files || []).map((f) => <FileChip key={f.id} f={f} onRemove={() => rmFile(p.id, f.id)} />)}
              <DropZone compact onFiles={(fs) => addFiles(p.id, fs)} label="Dépose les fichiers du projet ici" />
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title={modal.id ? "Modifier le projet" : "Nouveau projet"} onClose={() => setModal(null)}>
          <ProjectForm p={modal} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function ProjectForm({ p, onSave }) {
  const [f, setF] = useState(p);
  return (
    <div>
      <div className="field"><label>Nom</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex. Watchpoint" autoFocus /></div>
      <div className="field"><label>Description</label><input value={f.desc || ""} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="Optionnel" /></div>
      <div className="field"><label>Couleur</label>
        <div style={{ display: "flex", gap: 8 }}>
          {PALETTE.map((c) => (
            <button key={c} onClick={() => setF({ ...f, color: c })}
              style={{ width: 26, height: 26, borderRadius: 8, background: c, border: f.color === c ? "2px solid #fff" : "2px solid transparent" }} />
          ))}
        </div>
      </div>
      <button className="btn btn-green" style={{ width: "100%", justifyContent: "center" }} disabled={!f.name.trim()} onClick={() => onSave(f)}>
        <Check size={14} /> Enregistrer
      </button>
    </div>
  );
}

/* ============================== ESPACE PARTAGÉ ============================== */

function Shared({ userName, pushToast }) {
  const [shared, setShared] = useState(null);
  const [tab, setTab] = useState("chat");
  const [msg, setMsg] = useState("");
  const [stTitle, setStTitle] = useState("");
  const [stPrio, setStPrio] = useState(3);
  const [folder, setFolder] = useState("Général");
  const [newFolder, setNewFolder] = useState("");
  const [invite, setInvite] = useState(false);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  const load = async (announce) => {
    const cur = (await sGet(SHARED_KEY, true)) || { ...SHARED_DEFAULT };
    if (userName && !cur.members.includes(userName)) {
      cur.members.push(userName);
      await sSet(SHARED_KEY, cur, true);
    }
    setShared(cur);
    if (announce) pushToast("Espace partagé synchronisé");
  };
  useEffect(() => { load(false); const iv = setInterval(() => load(false), 30000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [shared && shared.messages.length, tab]);

  const mutate = async (fn) => {
    setBusy(true);
    const cur = (await sGet(SHARED_KEY, true)) || { ...SHARED_DEFAULT };
    if (userName && !cur.members.includes(userName)) cur.members.push(userName);
    fn(cur);
    await sSet(SHARED_KEY, cur, true);
    setShared({ ...cur });
    setBusy(false);
  };

  const send = () => {
    const text = msg.trim();
    if (!text) return;
    setMsg("");
    mutate((c) => c.messages.push({ id: uid(), author: userName, text, ts: Date.now() }));
  };
  const sendFile = (fs) => mutate((c) => {
    fs.forEach((f) => {
      c.files.push({ ...f, author: userName, folder });
      c.messages.push({ id: uid(), author: userName, text: `📎 Fichier partagé : ${f.name}`, ts: Date.now() });
    });
  });
  const addSharedTask = () => {
    if (!stTitle.trim()) return;
    mutate((c) => c.tasks.push({ id: uid(), title: stTitle.trim(), priority: stPrio, done: false, author: userName, date: todayISO() }));
    setStTitle("");
  };
  const toggleST = (id) => mutate((c) => { const t = c.tasks.find((x) => x.id === id); if (t) t.done = !t.done; });
  const delST = (id) => mutate((c) => { c.tasks = c.tasks.filter((t) => t.id !== id); });
  const dropFiles = (fs) => mutate((c) => fs.forEach((f) => c.files.push({ ...f, author: userName, folder })));
  const rmSharedFile = (id) => mutate((c) => { c.files = c.files.filter((f) => f.id !== id); });

  if (!shared) return <div className="empty"><RefreshCw size={20} className="spin" />Chargement de l'espace partagé…</div>;

  const folders = ["Général", ...Array.from(new Set(shared.files.map((f) => f.folder || "Général"))).filter((f) => f !== "Général")];
  const todayTasks = shared.tasks.filter((t) => t.date === todayISO() || !t.done).sort((a, b) => a.priority - b.priority);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div className="section-head">
        <div>
          <h2>Espace partagé</h2>
          <div className="hint" style={{ marginTop: 4 }}>
            {shared.members.length} membre{shared.members.length > 1 ? "s" : ""} : {shared.members.join(", ") || "—"} · espace « {getSpaceCode()} »
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => load(true)}><RefreshCw size={13} /> Actualiser</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { window.open("https://meet.new", "_blank"); pushToast("Crée ton Meet puis colle le lien dans la discussion"); }}>
            <Video size={13} /> Nouveau Meet
          </button>
          <button className="btn btn-sm" onClick={() => setInvite(true)}><Share2 size={13} /> Inviter</button>
        </div>
      </div>

      <div className="tabs">
        {[["chat", "Discussion"], ["tasks", "Tâches du jour"], ["files", "Fichiers"]].map(([k, l]) => (
          <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "chat" && (
        <div className="card chat-wrap" style={{ flex: 1, minHeight: 320 }}>
          <div className="chat-scroll" ref={scrollRef}>
            {shared.messages.length === 0 && <div className="empty"><Users size={22} />Aucun message. Lance la discussion ou partage un lien Meet.</div>}
            {shared.messages.map((m) => (
              <div key={m.id} className={"msg " + (m.author === userName ? "me" : "them")}>
                <div className="who">{m.author} · {fmtTime(m.ts)}</div>
                <div className="b">{linkify(m.text)}</div>
              </div>
            ))}
          </div>
          <div className="chat-bar">
            <div style={{ width: 150, flex: "none" }}>
              <DropZone compact label="Fichier" onFiles={sendFile} />
            </div>
            <input placeholder="Écris un message, colle un lien Meet…" value={msg}
              onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn" disabled={busy} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="card">
          <div style={{ display: "flex", gap: 9, marginBottom: 16, flexWrap: "wrap" }}>
            <input style={{ flex: "1 1 220px" }} placeholder="Tâche partagée du jour…" value={stTitle}
              onChange={(e) => setStTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSharedTask()} />
            <select style={{ width: 128 }} value={stPrio} onChange={(e) => setStPrio(Number(e.target.value))}>
              {Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button className="btn" onClick={addSharedTask}><Plus size={14} /> Ajouter</button>
          </div>
          {todayTasks.length === 0 && <div className="empty"><CheckSquare size={20} />Aucune tâche partagée pour l'instant.</div>}
          {todayTasks.map((t) => (
            <div key={t.id} className={"task-row" + (t.done ? " done" : "")}>
              <button className={"check" + (t.done ? " on" : "")} onClick={() => toggleST(t.id)}><Check size={12} strokeWidth={3} /></button>
              <span className="task-title">{t.title}</span>
              <span className="task-meta">par {t.author}</span>
              <span className="prio-dot" style={{ background: (PRIOS[t.priority] || PRIOS[3]).color }} />
              <button className="icon-btn red" onClick={() => delST(t.id)}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === "files" && (
        <div className="card">
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            {folders.map((f) => (
              <button key={f} className={"tab" + (folder === f ? " on" : "")} onClick={() => setFolder(f)}>
                <Folder size={11} style={{ marginRight: 5, verticalAlign: -1 }} />{f}
              </button>
            ))}
            <input style={{ width: 160 }} placeholder="Nouvelle dropbox…" value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newFolder.trim()) { setFolder(newFolder.trim()); setNewFolder(""); } }} />
          </div>
          <DropZone onFiles={dropFiles} label={`Glisse-dépose les fichiers dans « ${folder} »`} />
          <div style={{ marginTop: 14 }}>
            {shared.files.filter((f) => (f.folder || "Général") === folder).map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}><FileChip f={f} onRemove={() => rmSharedFile(f.id)} /></div>
                <span className="hint" style={{ flex: "none", marginBottom: 6 }}>par {f.author}</span>
              </div>
            ))}
            {shared.files.filter((f) => (f.folder || "Général") === folder).length === 0 && (
              <div className="hint" style={{ marginTop: 10 }}>Aucun fichier dans cette dropbox.</div>
            )}
          </div>
        </div>
      )}

      {invite && (
        <Modal title="Inviter dans l'espace partagé" onClose={() => setInvite(false)}>
          <div className="hint" style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
            Envoie ce lien à ton équipe (Léo, Marzuk…) : toute personne qui l'ouvre rejoint cet espace partagé —
            discussion, tâches du jour et dropbox synchronisées pour tout le monde.<br /><br />
            <span style={{ display: "block", padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, wordBreak: "break-all", color: "var(--blue2)" }}>{inviteUrl()}</span><br />
            <AlertTriangle size={13} style={{ verticalAlign: -2, color: "var(--text3)" }} /> Les données de l'espace partagé sont visibles par <b>tous les membres</b>. Tes onglets personnels (tâches, agenda, CRM) restent privés, liés à ton code de synchronisation.
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
            <button className="btn" style={{ flex: 1, justifyContent: "center" }}
              onClick={() => { navigator.clipboard.writeText(inviteUrl()).then(() => pushToast("Lien d'invitation copié", "green")); }}>
              <Link2 size={14} /> Copier le lien
            </button>
            <button className="btn btn-ghost" onClick={() => setInvite(false)}><Check size={14} /> Fermer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================== CRM ============================== */

const STAGES = ["Lead", "Contacté", "Proposition", "Client"];

function CRM({ data, update, pushToast }) {
  const [modal, setModal] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const dragId = useRef(null);

  const save = (c) => {
    update((d) => {
      if (c.id) { const i = d.contacts.findIndex((x) => x.id === c.id); if (i >= 0) d.contacts[i] = c; }
      else d.contacts.push({ ...c, id: uid() });
      return d;
    });
    setModal(null);
    pushToast("Contact enregistré", "green");
  };
  const remove = (id) => { update((d) => { d.contacts = d.contacts.filter((c) => c.id !== id); return d; }); setModal(null); pushToast("Contact supprimé", "red"); };
  const moveTo = (stage) => {
    const id = dragId.current;
    if (!id) return;
    update((d) => { const c = d.contacts.find((x) => x.id === id); if (c) c.stage = stage; return d; });
    setOverCol(null);
  };
  const total = data.contacts.reduce((s, c) => s + (Number(c.value) || 0), 0);

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>CRM</h2>
          <div className="hint" style={{ marginTop: 4 }}>{data.contacts.length} contact{data.contacts.length > 1 ? "s" : ""} · pipeline total : <b style={{ color: "var(--blue2)" }}>{total.toLocaleString("fr-FR")} €</b></div>
        </div>
        <button className="btn" onClick={() => setModal({ name: "", company: "", email: "", phone: "", stage: "Lead", value: "", notes: "" })}>
          <Plus size={14} /> Nouveau contact
        </button>
      </div>
      <div className="crm-board">
        {STAGES.map((st) => {
          const cards = data.contacts.filter((c) => c.stage === st);
          const colTotal = cards.reduce((s, c) => s + (Number(c.value) || 0), 0);
          return (
            <div key={st} className={"crm-col" + (overCol === st ? " over" : "")}
              onDragOver={(e) => { e.preventDefault(); setOverCol(st); }}
              onDragLeave={() => setOverCol(null)}
              onDrop={(e) => { e.preventDefault(); moveTo(st); }}>
              <div className="crm-col-head">
                <span className="n">{st}</span>
                <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700 }}>{cards.length}{colTotal ? " · " + colTotal.toLocaleString("fr-FR") + " €" : ""}</span>
              </div>
              {cards.map((c) => (
                <div key={c.id} className="crm-card" draggable
                  onDragStart={() => { dragId.current = c.id; }}
                  onClick={() => setModal(c)}>
                  <div className="nm">{c.name}</div>
                  {c.company && <div className="co">{c.company}</div>}
                  <div style={{ display: "flex", gap: 9, marginTop: 7, color: "var(--text3)" }}>
                    {c.email && <Mail size={12} />}
                    {c.phone && <Phone size={12} />}
                  </div>
                  {Number(c.value) > 0 && <div className="val">{Number(c.value).toLocaleString("fr-FR")} €</div>}
                </div>
              ))}
              {cards.length === 0 && <div className="hint" style={{ textAlign: "center", padding: "18px 0" }}>Glisse un contact ici</div>}
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal title={modal.id ? "Contact" : "Nouveau contact"} onClose={() => setModal(null)}>
          <ContactForm c={modal} onSave={save} onDelete={modal.id ? () => remove(modal.id) : null} />
        </Modal>
      )}
    </div>
  );
}

function ContactForm({ c, onSave, onDelete }) {
  const [f, setF] = useState(c);
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
        <div className="field"><label>Étape</label>
          <select value={f.stage} onChange={(e) => set("stage", e.target.value)}>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Valeur (€)</label><input type="number" value={f.value || ""} onChange={(e) => set("value", e.target.value)} /></div>
      </div>
      <div className="field"><label>Notes</label><textarea rows={3} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 9 }}>
        {onDelete && <button className="btn btn-red" onClick={onDelete}><Trash2 size={14} /> Supprimer</button>}
        <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} disabled={!f.name.trim()} onClick={() => onSave(f)}>
          <Check size={14} /> Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ============================== PARAMÈTRES ============================== */

function SyncCard({ pushToast }) {
  const [pc, setPc] = useState(localStorage.getItem("tt:code") || "");
  const [sc, setSc] = useState(localStorage.getItem("tt:space") || "");
  const apply = (k, v, label) => {
    if (!v.trim()) return;
    localStorage.setItem(k, v.trim());
    pushToast(label + " mis à jour — rechargement…", "green");
    setTimeout(() => window.location.replace(window.location.pathname), 700);
  };
  return (
    <div className="card span6">
      <div className="card-title">Synchronisation cloud</div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
        <span className="status-dot" style={{ background: cloudEnabled ? "var(--green)" : "var(--text3)" }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {cloudEnabled ? "Supabase connecté — données synchronisées entre tes appareils" : "Mode local — les données restent dans ce navigateur"}
        </span>
      </div>
      <div className="field"><label>Mon code de synchronisation (note-le : il identifie tes données)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={pc} onChange={(e) => setPc(e.target.value)} />
          <button className="btn btn-ghost btn-sm" style={{ flex: "none" }} onClick={() => apply("tt:code", pc, "Code personnel")}>Utiliser</button>
        </div>
      </div>
      <div className="field"><label>Code de l'espace partagé</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={sc} onChange={(e) => setSc(e.target.value)} />
          <button className="btn btn-ghost btn-sm" style={{ flex: "none" }} onClick={() => apply("tt:space", sc, "Espace partagé")}>Rejoindre</button>
        </div>
      </div>
      {!cloudEnabled && (
        <div className="hint">
          Pour activer la persistance cloud (multi-appareils + espace partagé multi-utilisateurs) : ajoute
          VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d'environnement Vercel — voir le README.
        </div>
      )}
    </div>
  );
}

function SettingsView({ data, update, pushToast, setData }) {
  const icsRef = useRef(null);
  const bakRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const importICS = async (file) => {
    const text = await file.text();
    const evs = parseICS(text);
    if (!evs.length) { pushToast("Aucun événement trouvé dans ce fichier .ics", "red"); return; }
    update((d) => { d.events = [...d.events, ...evs]; return d; });
    pushToast(`${evs.length} événement(s) importé(s) dans l'agenda`, "green");
  };
  const exportICS = () => {
    download("tasks-tracker.ics", buildICS(data.events, data.tasks), "text/calendar");
    pushToast("Agenda exporté (.ics) — importe-le dans Google ou Apple Calendar", "green");
  };
  const exportJSON = () => {
    download("tasks-tracker-backup.json", JSON.stringify(data, null, 2), "application/json");
    pushToast("Sauvegarde téléchargée", "green");
  };
  const importJSON = async (file) => {
    try {
      const obj = JSON.parse(await file.text());
      if (!obj.tasks || !obj.events) throw new Error("format");
      setData(obj);
      pushToast("Sauvegarde restaurée", "green");
    } catch (e) { pushToast("Fichier de sauvegarde invalide", "red"); }
  };
  const reset = async () => {
    await sDel(DATA_KEY);
    setData(structuredClone(SEED));
    setConfirmReset(false);
    pushToast("Application réinitialisée", "red");
  };

  const ConnRow = ({ name, hint }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <span className="status-dot" style={{ background: "var(--text3)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
        <div className="hint">{hint}</div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => icsRef.current && icsRef.current.click()}><Upload size={12} /> Importer .ics</button>
    </div>
  );

  return (
    <div className="bento">
      <div className="card span6">
        <div className="card-title">Profil</div>
        <div className="field"><label>Ton prénom (affiché dans l'espace partagé)</label>
          <input value={data.settings.userName} onChange={(e) => update((d) => { d.settings.userName = e.target.value; return d; })} />
        </div>
      </div>

      <div className="card span6">
        <div className="card-title">Rappels</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button className={"check" + (data.settings.remindersOn ? " on" : "")}
            onClick={() => update((d) => { d.settings.remindersOn = !d.settings.remindersOn; return d; })}>
            <Check size={12} strokeWidth={3} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications de rappel (tâches et événements horodatés)</span>
        </div>
        <div className="field"><label>Me prévenir avant</label>
          <select value={data.settings.reminderMinutes}
            onChange={(e) => update((d) => { d.settings.reminderMinutes = Number(e.target.value); return d; })}>
            <option value={10}>10 minutes</option><option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option><option value={60}>1 heure</option>
          </select>
        </div>
      </div>

      <SyncCard pushToast={pushToast} />

      <div className="card span6">
        <div className="card-title">Calendriers connectés</div>
        <ConnRow name="Google Calendar" hint="Google Agenda → Paramètres → Importation/Exportation → Exporter, puis importe le .ics ici." />
        <ConnRow name="Apple Calendar" hint="Calendrier (Mac) → Fichier → Exporter, puis importe le .ics ici." />
        <input ref={icsRef} type="file" accept=".ics" style={{ display: "none" }}
          onChange={(e) => { if (e.target.files[0]) { importICS(e.target.files[0]); e.target.value = ""; } }} />
        <div style={{ marginTop: 13 }}>
          <button className="btn btn-sm" onClick={exportICS}><Download size={12} /> Exporter mon agenda (.ics)</button>
        </div>
        <div className="hint" style={{ marginTop: 11 }}>
          La synchronisation OAuth en temps réel nécessite un backend déployé (je peux te préparer cette version).
          En attendant, l'import/export .ics est 100 % compatible Google et Apple, dans les deux sens.
        </div>
      </div>

      <div className="card span6">
        <div className="card-title">Données & sauvegarde</div>
        <div className="hint" style={{ marginBottom: 13 }}>
          <Database size={12} style={{ verticalAlign: -2, marginRight: 5, color: cloudEnabled ? "var(--green)" : "var(--text3)" }} />
          {cloudEnabled
            ? "Tes données sont stockées sur Supabase : elles survivent au vidage du cache, à l'extinction du Mac et au changement de navigateur ou d'appareil."
            : "Mode local : les données restent dans ce navigateur. Active Supabase (carte Synchronisation) pour la persistance cloud complète — en attendant, exporte régulièrement une sauvegarde."}
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={exportJSON}><Download size={12} /> Exporter une sauvegarde (.json)</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bakRef.current && bakRef.current.click()}><Upload size={12} /> Restaurer (.json)</button>
          <input ref={bakRef} type="file" accept=".json" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) { importJSON(e.target.files[0]); e.target.value = ""; } }} />
        </div>
        <div className="divider" />
        {!confirmReset ? (
          <button className="btn btn-red btn-sm" onClick={() => setConfirmReset(true)}><Trash2 size={12} /> Réinitialiser l'application</button>
        ) : (
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 600 }}>Tout supprimer définitivement ?</span>
            <button className="btn btn-red btn-sm" onClick={reset}><Check size={12} /> Oui</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== APP ============================== */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "tasks", label: "Tâches", icon: CheckSquare },
  { id: "projects", label: "Projets", icon: FolderKanban },
  { id: "shared", label: "Espace partagé", icon: Users },
  { id: "crm", label: "CRM", icon: Briefcase },
  { id: "settings", label: "Paramètres", icon: SettingsIcon },
];
const TITLES = {
  dashboard: "Dashboard", agenda: "Agenda", tasks: "Tâches", projects: "Projets",
  shared: "Espace partagé", crm: "CRM", settings: "Paramètres",
};

export default function App() {
  const [data, setDataRaw] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [savedAt, setSavedAt] = useState(null);
  const notifiedRef = useRef(new Set());

  const pushToast = (text, kind = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const setData = (d) => setDataRaw(d);
  const update = (fn) => setDataRaw((d) => fn(structuredClone(d)));

  /* Chargement initial depuis le stockage persistant */
  useEffect(() => {
    (async () => {
      const saved = await sGet(DATA_KEY);
      if (saved && saved.tasks) setDataRaw(saved);
      else { setDataRaw(structuredClone(SEED)); sSet(DATA_KEY, SEED); }
      setLoaded(true);
    })();
  }, []);

  /* Sauvegarde automatique (debounce) */
  useEffect(() => {
    if (!loaded || !data) return;
    const t = setTimeout(async () => {
      const ok = await sSet(DATA_KEY, data);
      if (ok) setSavedAt(Date.now());
    }, 700);
    return () => clearTimeout(t);
  }, [data, loaded]);

  /* Rappels */
  useEffect(() => {
    if (!loaded || !data) return;
    const check = () => {
      if (!data.settings.remindersOn) return;
      const now = new Date();
      const lead = data.settings.reminderMinutes * 60000;
      const found = [];
      data.events.forEach((e) => {
        if (e.date === todayISO() && e.start) {
          const t = new Date(`${e.date}T${e.start}`);
          const diff = t - now;
          if (diff > 0 && diff <= lead && !notifiedRef.current.has("e" + e.id)) {
            notifiedRef.current.add("e" + e.id);
            found.push({ id: uid(), text: `Événement à ${e.start} : ${e.title}`, ts: Date.now() });
          }
        }
      });
      data.tasks.forEach((tk) => {
        if (!tk.done && tk.date === todayISO() && tk.time) {
          const t = new Date(`${tk.date}T${tk.time}`);
          const diff = t - now;
          if (diff > 0 && diff <= lead && !notifiedRef.current.has("t" + tk.id)) {
            notifiedRef.current.add("t" + tk.id);
            found.push({ id: uid(), text: `Tâche prévue à ${tk.time} : ${tk.title}`, ts: Date.now() });
          }
        }
      });
      if (found.length) {
        setNotifs((n) => [...found, ...n].slice(0, 30));
        found.forEach((f) => pushToast("🔔 " + f.text));
      }
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [loaded, data]);

  const itemsByDate = useMemo(() => {
    if (!data) return {};
    const map = {};
    const push = (date, item) => { if (!date) return; (map[date] = map[date] || []).push(item); };
    data.events.forEach((e) => push(e.date, { type: "event", title: e.title, time: e.start }));
    data.tasks.forEach((t) => { if (!t.done) push(t.date, { type: "task", title: t.title, priority: t.priority, time: t.time }); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.time || "99").localeCompare(b.time || "99")));
    return map;
  }, [data]);

  if (!loaded || !data) {
    return (
      <div className="tt-app" style={{ alignItems: "center", justifyContent: "center" }}>
        <style>{CSS}</style>
        <div className="empty"><Database size={22} style={{ color: "var(--blue2)" }} />Chargement de Tasks Tracker…</div>
      </div>
    );
  }

  const initials = (data.settings.userName || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="tt-app">
      <style>{CSS}</style>

      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">TT</div>
          <div className="logo-name">Tasks Tracker</div>
        </div>
        {NAV.map((n) => (
          <button key={n.id} className={"nav-item" + (view === n.id ? " active" : "")} onClick={() => setView(n.id)}>
            <n.icon size={17} /><span>{n.label}</span>
          </button>
        ))}
        <div className="sidebar-foot">
          <span className="sync-dot" style={{ background: cloudEnabled ? "var(--green)" : "var(--text3)" }} />
          <span>{cloudEnabled ? "Cloud" : "Local"}{savedAt ? " · " + fmtTime(savedAt) : ""}</span>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{TITLES[view]}</h1>
          <div className="topbar-right">
            <button className="icon-btn" style={{ position: "relative" }} onClick={() => setShowNotifs((s) => !s)}>
              <Bell size={17} />
              {notifs.length > 0 && <span className="badge">{notifs.length}</span>}
            </button>
            {showNotifs && (
              <div className="notif-pop">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text2)" }}>Notifications</span>
                  {notifs.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setNotifs([])}>Tout effacer</button>}
                </div>
                {notifs.length === 0 && <div className="hint" style={{ padding: "10px 0" }}>Aucune notification. Les rappels apparaîtront ici.</div>}
                {notifs.map((n) => (
                  <div key={n.id} className="notif-item">{n.text}<div className="t">{fmtTime(n.ts)}</div></div>
                ))}
              </div>
            )}
            <div className="avatar" title={data.settings.userName}>{initials}</div>
          </div>
        </header>

        <main className="content" onClick={() => showNotifs && setShowNotifs(false)}>
          {view === "dashboard" && <Dashboard data={data} update={update} itemsByDate={itemsByDate} goTo={setView} setSelectedDate={setSelectedDate} />}
          {view === "agenda" && <Agenda data={data} update={update} itemsByDate={itemsByDate} pushToast={pushToast} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {view === "tasks" && <Tasks data={data} update={update} pushToast={pushToast} />}
          {view === "projects" && <Projects data={data} update={update} pushToast={pushToast} />}
          {view === "shared" && <Shared userName={data.settings.userName} pushToast={pushToast} />}
          {view === "crm" && <CRM data={data} update={update} pushToast={pushToast} />}
          {view === "settings" && <SettingsView data={data} update={update} pushToast={pushToast} setData={setData} />}
        </main>
      </div>

      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={"toast " + t.kind}>{t.text}</div>)}
      </div>
    </div>
  );
}
