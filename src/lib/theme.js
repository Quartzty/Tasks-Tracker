/* ============================================================================
   theme.js — design system v2 : thèmes sombre/clair + accent dynamique.
   L'accent (hex) est posé en inline-style --ac sur .tt-app ; --acs / --ac2 en
   dérivent via color-mix. Le thème bascule via [data-theme] sur .tt-app.
   ========================================================================== */

export const ACCENTS = [
  { id: "blue",   label: "Bleu électrique", hex: "#2D6BFF" },
  { id: "violet", label: "Violet",          hex: "#8B7CFF" },
  { id: "cyan",   label: "Cyan",            hex: "#22C7D6" },
  { id: "green",  label: "Vert",            hex: "#2FBF71" },
  { id: "amber",  label: "Ambre",           hex: "#F59E0B" },
];

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');

.tt-app{
  --acs: color-mix(in srgb, var(--ac) 13%, transparent);
  --gns: color-mix(in srgb, var(--gn) 15%, transparent);
  --rds: color-mix(in srgb, var(--rd) 14%, transparent);
  --ams: color-mix(in srgb, var(--am) 16%, transparent);
  --radius:14px; --radius-sm:10px; --radius-xs:6px;
  --mono:'Geist Mono',ui-monospace,'SF Mono',Menlo,monospace;
}
.tt-app[data-theme="dark"]{
  --bg:#0A0A0A; --surface:#18181A; --surface2:#232326; --surface3:#2A2A2E;
  --bd:#2A2A2E; --bd2:#3A3A3F;
  --tx:#FAFAFA; --t2:#8A8A90; --t2b:#6E6E76; --t3:#56565E;
  --gn:#22C55E; --rd:#EF4444; --am:#F59E0B;
  --ac:#FAFAFA; --acT:#FAFAFA; --ac2:#FAFAFA;
  --shadow:0 18px 44px rgba(0,0,0,.6); --scrim:rgba(0,0,0,.66);
  --glow:0 0 26px rgba(255,255,255,.05); --scan:rgba(255,255,255,.9);
}
.tt-app[data-theme="light"]{
  --bg:#FFFFFF; --surface:#FFFFFF; --surface2:#F4F4F5; --surface3:#ECECEE;
  --bd:#E7E7EA; --bd2:#D6D6DB;
  --tx:#0A0A0A; --t2:#71717A; --t2b:#85858E; --t3:#A1A1AA;
  --gn:#16A34A; --rd:#DC2626; --am:#D97706;
  --ac:#18181B; --acT:#18181B; --ac2:#000000;
  --shadow:0 18px 44px rgba(20,20,40,.1); --scrim:rgba(20,20,30,.3);
  --glow:0 10px 28px rgba(20,20,45,.09); --scan:rgba(10,10,15,.55);
}

.tt-app *{box-sizing:border-box;}
.tt-app{display:flex;height:100vh;width:100%;background:var(--bg);color:var(--tx);
  font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-size:15px;line-height:1.5;overflow:hidden;
  -webkit-font-smoothing:antialiased;}
.tt-app a{color:var(--acT);text-decoration:none;}
.tt-app a:hover{text-decoration:underline;}
.tt-app .mono{font-family:var(--mono);font-feature-settings:"tnum";}
.tt-app ::-webkit-scrollbar{width:9px;height:9px;}
.tt-app ::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:8px;}
.tt-app ::-webkit-scrollbar-track{background:transparent;}
.tt-app button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
.tt-app input,.tt-app select,.tt-app textarea{font-family:inherit;font-size:14px;color:var(--tx);background:var(--surface2);
  border:1px solid var(--bd);border-radius:8px;padding:11px 14px;outline:none;width:100%;transition:border-color .12s;}
.tt-app input:focus,.tt-app select:focus,.tt-app textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--acs);}
.tt-app input::placeholder,.tt-app textarea::placeholder{color:var(--t3);}
.tt-app textarea{resize:vertical;line-height:1.5;}

/* ------- Sidebar ------- */
.sidebar{width:236px;min-width:236px;border-right:1px solid var(--bd);display:flex;flex-direction:column;
  padding:16px 12px;background:var(--surface);}
.logo{display:flex;align-items:center;gap:10px;padding:4px 8px 12px;}
.logo-mark{width:30px;height:30px;border-radius:9px;background:var(--ac);display:flex;align-items:center;
  justify-content:center;font-weight:800;font-size:14px;color:#fff;}
.logo-name{font-weight:700;font-size:15px;letter-spacing:-.02em;}
.cmdk-btn{display:flex;align-items:center;gap:8px;width:100%;font-size:12.5px;color:var(--t3);background:var(--surface2);
  border:1px solid var(--bd);border-radius:9px;padding:8px 10px;margin-bottom:8px;transition:border-color .12s;}
.cmdk-btn:hover{border-color:var(--bd2);color:var(--t2);}
.cmdk-btn .kbd{margin-left:auto;font-family:var(--mono);font-size:10.5px;background:var(--surface3);
  border:1px solid var(--bd2);border-radius:5px;padding:1px 6px;color:var(--t2);}
.nav-seg{font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--t3);text-transform:uppercase;padding:11px 10px 5px;}
.nav-item{display:flex;align-items:center;gap:11px;padding:8px 11px;border-radius:9px;color:var(--t2);font-weight:500;
  font-size:13.5px;margin-bottom:1px;width:100%;text-align:left;transition:background .12s,color .12s;}
.nav-item:hover{background:var(--surface2);color:var(--tx);}
.nav-item.active{background:var(--acs);color:var(--acT);font-weight:600;}
.nav-item .cnt{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--t3);}
.nav-item.active .cnt{color:var(--acT);}
.sidebar-foot{margin-top:auto;padding-top:10px;border-top:1px solid var(--bd);}
.sync-row{display:flex;align-items:center;gap:9px;color:var(--t3);font-size:11.5px;padding:7px 10px;}
.sync-dot{width:7px;height:7px;border-radius:50%;flex:none;}

/* ------- Topbar + layout ------- */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:56px;min-height:56px;border-bottom:1px solid var(--bd);display:flex;align-items:center;
  justify-content:space-between;padding:0 22px;background:var(--surface);}
.topbar h1{font-size:15px;font-weight:700;letter-spacing:-.01em;}
.topbar-right{display:flex;align-items:center;gap:10px;position:relative;}
.avatar{width:31px;height:31px;border-radius:50%;background:var(--ac);display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:12px;color:#fff;}
.content{flex:1;overflow-y:auto;padding:22px;}

/* ------- Cards & bento ------- */
.card{background:var(--surface);border:1px solid var(--bd);border-radius:var(--radius);padding:24px;}
.card-title{font-size:11.5px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.06em;
  margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:8px;}
.bento{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;align-items:start;}

/* ---- Interactions tech-terminal (composants 21st.dev de Louis) ---- */
.tt-app [data-slot="card"],.tt-app .card{transition:border-color .25s ease,box-shadow .25s ease,transform .2s ease;}
.tt-app [data-slot="card"]:hover,.tt-app .card:hover{border-color:var(--bd2);box-shadow:var(--glow);}
/* éléments cliquables : léger lift + bordure qui s'éclaire */
.tt-app .lift{transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease,background .2s ease;}
.tt-app .lift:hover{transform:translateY(-2px);border-color:var(--t2b);box-shadow:var(--glow);}
/* scanline au survol (effet SCAN_ACTIVE) */
.tt-app .tt-scan{position:relative;overflow:hidden;}
.tt-app .tt-scan::after{content:"";position:absolute;left:0;top:-2px;width:100%;height:2px;
  background:linear-gradient(90deg,transparent,var(--scan),transparent);opacity:0;pointer-events:none;}
.tt-app .tt-scan:hover::after{animation:tt-scanline .9s linear;}
@keyframes tt-scanline{0%{top:-2px;opacity:.85}90%{opacity:.85}100%{top:100%;opacity:0}}
/* bordure dashed au survol (effet HOVER.DETECTED) */
.tt-app .dash-hover{transition:border-color .2s ease;}
.tt-app .dash-hover:hover{border-style:dashed;border-color:var(--tx);}
/* GlowCard adapté monochrome : halo blanc qui suit la souris */
.tt-app .tt-glow{position:relative;border:1px solid var(--bd);border-radius:14px;background:var(--surface);overflow:hidden;transition:border-color .25s ease,transform .2s ease;}
.tt-app .tt-glow:hover{border-color:var(--bd2);}
.tt-app .tt-glow::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s ease;pointer-events:none;
  background:radial-gradient(240px circle at var(--mx,50%) var(--my,50%), color-mix(in srgb, var(--tx) 12%, transparent), transparent 62%);}
.tt-app .tt-glow:hover::before{opacity:1;}
/* tuile « 01 » : scale au survol */
.tt-app .tt-tile{transition:transform .25s ease,border-color .25s ease,background .25s ease;}
.tt-app .tt-tile:hover{transform:scale(1.04);border-color:var(--tx);background:var(--surface2);}
/* loader carré (adapté monochrome) */
.tt-app .tt-loader{position:relative;width:56px;aspect-ratio:1;}
.tt-app .tt-loader span{position:absolute;border-radius:50px;box-shadow:inset 0 0 0 3px var(--tx);animation:tt-loaderAnim 2.5s infinite;}
.tt-app .tt-loader span:nth-child(2){animation-delay:-1.25s;}
@keyframes tt-loaderAnim{0%{inset:0 30px 30px 0}12.5%{inset:0 30px 0 0}25%{inset:30px 30px 0 0}37.5%{inset:30px 0 0 0}50%{inset:30px 0 0 30px}62.5%{inset:0 0 0 30px}75%{inset:0 0 30px 30px}87.5%{inset:0 0 30px 0}100%{inset:0 30px 30px 0}}
.span2{grid-column:span 2;}.span3{grid-column:span 3;}.span4{grid-column:span 4;}.span5{grid-column:span 5;}
.span6{grid-column:span 6;}.span7{grid-column:span 7;}.span8{grid-column:span 8;}.span9{grid-column:span 9;}.span12{grid-column:span 12;}
@media(max-width:1180px){.span3,.span4,.span5,.span6{grid-column:span 6;}.span7,.span8,.span9{grid-column:span 12;}}
@media(max-width:760px){.span2,.span3,.span4,.span5,.span6,.span7,.span8,.span9{grid-column:span 12;}}
.stat-num{font-family:var(--mono);font-size:32px;font-weight:600;letter-spacing:-.02em;line-height:1;}
.stat-label{font-size:13.5px;color:var(--t2);margin-top:9px;font-weight:500;}
.delta{font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-top:6px;}

/* ------- Buttons ------- */
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--ac);color:var(--bg);font-weight:600;
  font-size:13.5px;padding:12px 18px;border-radius:9px;transition:opacity .12s,transform .05s;white-space:nowrap;}
.btn:hover{opacity:.9;}.btn:active{transform:scale(.985);}
.btn-ghost{background:var(--surface2);color:var(--tx);border:1px solid var(--bd);transition:border-color .2s ease,background .2s ease;}
.btn-ghost:hover{border-color:var(--t2);background:var(--surface3);opacity:1;}
.btn-green{background:var(--gn);}.btn-red{background:var(--rd);}
.btn-sm{padding:8px 14px;font-size:13px;border-radius:8px;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;
  border-radius:8px;color:var(--t2);transition:background .12s,color .12s;flex:none;}
.icon-btn:hover{background:var(--surface3);color:var(--tx);}
.icon-btn.red:hover{background:var(--rds);color:var(--rd);}
.icon-btn.green:hover{background:var(--gns);color:var(--gn);}

/* ------- Check / prio / status / tag / chip ------- */
.check{width:21px;height:21px;border-radius:6px;border:1.6px solid var(--bd2);display:flex;align-items:center;
  justify-content:center;flex:none;transition:all .12s;color:transparent;}
.check:hover{border-color:var(--gn);}
.check.on{background:var(--gn);border-color:var(--gn);color:#fff;}
.prio{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;padding:5px 12px;
  border-radius:999px;background:var(--surface3);color:var(--t2);white-space:nowrap;}
.prio-dot{width:7px;height:7px;border-radius:50%;flex:none;}
.statpill{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;}
.tag{font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:var(--acs);color:var(--acT);white-space:nowrap;}
.tag.muted{background:var(--surface3);color:var(--t3);cursor:pointer;}
.chip{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--t2);background:var(--surface2);
  border:1px solid var(--bd);border-radius:9px;padding:8px 11px;cursor:pointer;transition:border-color .12s;}
.chip:hover{border-color:var(--bd2);}

/* ------- Task rows ------- */
.task-row{display:flex;align-items:center;gap:13px;padding:12px 16px;min-height:48px;border:1px solid var(--bd);
  border-radius:var(--radius-sm);background:var(--surface);margin-bottom:10px;transition:border-color .12s;cursor:pointer;}
.task-row:hover{border-color:var(--bd2);}
.task-row.sel{border-color:var(--ac);background:var(--acs);}
.task-row.dragging{opacity:.4;}
.task-row.done .task-title{text-decoration:line-through;color:var(--t3);}
.task-title{font-weight:500;font-size:15px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.task-meta{display:flex;align-items:center;gap:6px;color:var(--t3);font-size:12.5px;flex:none;}
.grip{color:var(--t3);cursor:grab;flex:none;display:flex;}

/* ------- Slide-over sheet (édition complète) ------- */
.sheet-scrim{position:fixed;inset:0;background:var(--scrim);z-index:120;animation:fade .15s ease;}
.sheet{position:fixed;top:0;right:0;height:100vh;width:470px;max-width:94vw;background:var(--surface);
  border-left:1px solid var(--bd2);z-index:121;display:flex;flex-direction:column;box-shadow:var(--shadow);
  animation:slidein .2s cubic-bezier(.3,.8,.4,1);}
@keyframes slidein{from{transform:translateX(26px);opacity:.4;}to{transform:none;opacity:1;}}
@keyframes fade{from{opacity:0;}to{opacity:1;}}
.sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:22px 24px 18px;border-bottom:1px solid var(--bd);}
.sheet-body{flex:1;overflow-y:auto;padding:22px 24px 32px;}
.sheet-foot{padding:16px 24px;border-top:1px solid var(--bd);display:flex;gap:10px;}
.field{margin-bottom:18px;}
.field label,.flabel{display:block;font-size:12px;font-weight:600;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

/* ------- Modal ------- */
.backdrop{position:fixed;inset:0;background:var(--scrim);display:flex;align-items:center;justify-content:center;
  z-index:120;backdrop-filter:blur(3px);animation:fade .15s ease;}
.modal{width:480px;max-width:92vw;max-height:88vh;overflow-y:auto;background:var(--surface);
  border:1px solid var(--bd2);border-radius:var(--radius);padding:28px;box-shadow:var(--shadow);}
.modal h3{font-size:15px;font-weight:700;letter-spacing:-.01em;}
.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}

/* ------- Command palette ------- */
.cmdk-scrim{position:fixed;inset:0;background:var(--scrim);z-index:200;display:flex;justify-content:center;
  align-items:flex-start;padding-top:12vh;backdrop-filter:blur(3px);animation:fade .12s ease;}
.cmdk{width:580px;max-width:92vw;background:var(--surface);border:1px solid var(--bd2);border-radius:14px;
  box-shadow:var(--shadow);overflow:hidden;animation:pop .14s ease;}
@keyframes pop{from{transform:scale(.98);opacity:.5;}to{transform:none;opacity:1;}}
.cmdk-input-wrap{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--bd);}
.cmdk-input{border:none;background:none;font-size:15px;padding:0;box-shadow:none !important;}
.cmdk-input:focus{box-shadow:none !important;}
.cmdk-list{max-height:340px;overflow-y:auto;padding:8px;}
.cmdk-group{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);padding:9px 10px 4px;}
.cmdk-item{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;cursor:pointer;}
.cmdk-item .ci-ic{width:26px;height:26px;border-radius:7px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--t2);flex:none;}
.cmdk-item .ci-t{flex:1;min-width:0;font-size:13.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cmdk-item .ci-s{font-size:11px;color:var(--t3);flex:none;}
.cmdk-item.active{background:var(--acs);}
.cmdk-item.active .ci-ic{background:var(--ac);color:#fff;}
.cmdk-item.active .ci-t{color:var(--acT);}
.cmdk-empty{padding:26px;text-align:center;color:var(--t3);font-size:13px;}

/* ------- Timeline (activité) ------- */
.tl{position:relative;padding-left:20px;}
.tl:before{content:"";position:absolute;left:5px;top:7px;bottom:7px;width:1.5px;background:var(--bd2);}
.tli{position:relative;padding:6px 0 16px;}
.tli .tl-dot{position:absolute;left:-19px;top:8px;width:10px;height:10px;border-radius:50%;background:var(--surface);border:2px solid var(--ac);}
.tli .tl-dot.gn{border-color:var(--gn);}.tli .tl-dot.am{border-color:var(--am);}.tli .tl-dot.rd{border-color:var(--rd);}.tli .tl-dot.t3{border-color:var(--t3);}
.tli .tl-tx{font-size:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.tli .tl-tx .ic{color:var(--t3);display:flex;}
.tli .tl-time{font-family:var(--mono);font-size:11.5px;color:var(--t3);margin-top:4px;}

/* ------- Note (mémoire) ------- */
.note{background:var(--surface2);border:1px solid var(--bd);border-radius:11px;padding:14px 16px;margin-bottom:10px;cursor:pointer;transition:border-color .12s;}
.note:hover{border-color:var(--bd2);}
.note .nt{font-size:14px;font-weight:600;display:flex;align-items:center;gap:7px;}
.note .nb{font-size:12.5px;color:var(--t2);margin-top:5px;line-height:1.55;white-space:pre-wrap;}
.note .lk{color:var(--acT);}

/* ------- Dropzone / file chip ------- */
.dropzone{border:1.5px dashed var(--bd2);border-radius:var(--radius-sm);padding:20px;display:flex;
  flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--t3);font-size:13.5px;
  cursor:pointer;transition:all .15s;text-align:center;}
.dropzone:hover{border-color:var(--t3);color:var(--t2);}
.dropzone.over{border-color:var(--ac);background:var(--acs);color:var(--acT);}
.file-chip{display:flex;align-items:center;gap:9px;padding:10px 13px;border:1px solid var(--bd);
  border-radius:8px;background:var(--surface2);font-size:13px;margin-bottom:8px;}
.file-chip .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}
.file-chip .size{color:var(--t3);font-size:11px;flex:none;}

/* ------- Charts ------- */
.spark{width:100%;height:44px;display:block;}
.bars{display:flex;flex-direction:column;gap:9px;}
.bars .b{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--t2);}
.bars .b .tr{flex:1;height:8px;background:var(--surface3);border-radius:99px;overflow:hidden;}
.bars .b .tr i{display:block;height:100%;border-radius:99px;}
.heat{display:grid;grid-template-columns:repeat(20,1fr);gap:3px;}
.heat .c{aspect-ratio:1;border-radius:2px;background:var(--surface3);}
.leg{display:flex;gap:14px;font-size:11.5px;color:var(--t2);flex-wrap:wrap;}
.leg span{display:flex;align-items:center;gap:6px;}
.sw{width:10px;height:10px;border-radius:3px;flex:none;}

/* ------- Mini calendar ------- */
.mini-cal{user-select:none;}
.mini-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
.mini-head .m{font-weight:700;font-size:13px;text-transform:capitalize;}
.mini-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.mini-dow{font-size:10px;color:var(--t3);text-align:center;font-weight:600;padding-bottom:4px;}
.mini-day{position:relative;aspect-ratio:1;border-radius:8px;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;font-size:11.5px;color:var(--t2);cursor:pointer;transition:background .12s;}
.mini-day:hover{background:var(--surface3);color:var(--tx);}
.mini-day.out{color:var(--t3);opacity:.4;}
.mini-day.today{color:var(--acT);font-weight:700;}
.mini-day.sel{background:var(--ac);color:#fff;font-weight:700;}
.mini-dots{display:flex;gap:2px;height:4px;}
.mini-dots i{width:4px;height:4px;border-radius:50%;display:block;}

/* ------- Big calendar ------- */
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px;flex-wrap:wrap;}
.cal-head .m{font-size:16px;font-weight:700;text-transform:capitalize;letter-spacing:-.01em;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}
.cal-dow{font-size:10.5px;color:var(--t3);font-weight:600;text-align:center;padding:4px 0;text-transform:uppercase;letter-spacing:.05em;}
.cal-cell{min-height:106px;border:1px solid var(--bd);border-radius:var(--radius-sm);padding:9px;cursor:pointer;
  transition:border-color .12s,background .12s;background:var(--surface);overflow:hidden;}
.cal-cell:hover{border-color:var(--bd2);}
.cal-cell.out{opacity:.45;}
.cal-cell.sel{border-color:var(--ac);background:var(--acs);}
.cal-num{font-size:11.5px;font-weight:600;color:var(--t2);margin-bottom:5px;font-family:var(--mono);}
.cal-cell.today .cal-num{color:var(--acT);font-weight:800;}
.cal-chip{font-size:10.5px;font-weight:500;padding:2.5px 7px;border-radius:6px;margin-bottom:3px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:5px;}
.cal-chip.ev{background:var(--acs);color:var(--acT);}
.cal-chip.tk{background:var(--surface3);color:var(--t2);}
.cal-chip .pd{width:5px;height:5px;border-radius:50%;flex:none;}
.cal-more{font-size:10px;color:var(--t3);font-weight:600;}

/* ------- Tabs / segmented ------- */
.tabs{display:flex;gap:8px;flex-wrap:wrap;}
.tab{padding:9px 16px;border-radius:999px;font-size:13.5px;font-weight:600;color:var(--t2);
  background:var(--surface2);border:1px solid var(--bd);transition:all .12s;}
.tab:hover{color:var(--tx);}
.tab.on{background:var(--acs);color:var(--acT);border-color:transparent;}
.segmented{display:inline-flex;background:var(--surface2);border:1px solid var(--bd);border-radius:9px;padding:3px;gap:2px;}
.segmented button{padding:5px 11px;border-radius:7px;font-size:12px;font-weight:600;color:var(--t2);}
.segmented button.on{background:var(--surface);color:var(--tx);box-shadow:0 1px 2px rgba(0,0,0,.12);}

/* ------- CRM kanban ------- */
.crm-board{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-items:start;}
@media(max-width:1100px){.crm-board{grid-template-columns:repeat(2,1fr);}}
.crm-col{background:var(--surface);border:1px solid var(--bd);border-radius:var(--radius);padding:16px;min-height:260px;}
.crm-col.over{border-color:var(--ac);background:var(--acs);}
.crm-col-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
.crm-col-head .n{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--t2);}
.crm-card{background:var(--surface2);border:1px solid var(--bd);border-radius:var(--radius-sm);padding:15px;margin-bottom:11px;cursor:grab;transition:border-color .12s;}
.crm-card:hover{border-color:var(--bd2);}
.crm-card .nm{font-weight:600;font-size:14px;margin-bottom:3px;}
.crm-card .co{color:var(--t2);font-size:12.5px;}
.crm-card .val{color:var(--acT);font-weight:700;font-size:12px;margin-top:7px;font-family:var(--mono);}

/* ------- Chat (espace partagé) ------- */
.chat-wrap{display:flex;flex-direction:column;height:100%;min-height:0;}
.chat-scroll{flex:1;overflow-y:auto;padding:4px 2px;min-height:0;}
.msg{max-width:72%;margin-bottom:10px;}
.msg .b{padding:11px 15px;border-radius:14px;font-size:14px;line-height:1.5;word-break:break-word;}
.msg.me{margin-left:auto;}.msg.me .b{background:var(--ac);color:#fff;border-bottom-right-radius:5px;}
.msg.me .b a{color:#dce8ff;}
.msg.them .b{background:var(--surface3);border-bottom-left-radius:5px;}
.msg .who{font-size:10.5px;color:var(--t3);margin:0 4px 3px;font-weight:600;}
.msg.me .who{text-align:right;}
.chat-bar{display:flex;gap:8px;padding-top:12px;border-top:1px solid var(--bd);align-items:center;}

/* ------- Divers ------- */
.progress{height:6px;border-radius:99px;background:var(--surface3);overflow:hidden;}
.progress i{display:block;height:100%;background:var(--ac);border-radius:99px;transition:width .3s;}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--t3);
  padding:44px 18px;text-align:center;font-size:14px;}
.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:14px;flex-wrap:wrap;}
.section-head h2{font-size:21px;font-weight:700;letter-spacing:-.02em;}
.hint{font-size:13px;color:var(--t3);line-height:1.6;}
.divider{height:1px;background:var(--bd);margin:13px 0;}
.status-dot{width:8px;height:8px;border-radius:50%;flex:none;}
.notif-pop{position:absolute;top:42px;right:0;width:312px;background:var(--surface);border:1px solid var(--bd2);
  border-radius:var(--radius);padding:12px;z-index:90;box-shadow:var(--shadow);}
.notif-item{padding:9px 10px;border-radius:8px;font-size:12.5px;color:var(--tx);background:var(--surface2);margin-bottom:6px;}
.notif-item .t{color:var(--t3);font-size:10.5px;margin-top:3px;}
.badge{position:absolute;top:-4px;right:-4px;min-width:15px;height:15px;border-radius:8px;background:var(--rd);
  color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}
.toasts{position:fixed;bottom:20px;right:20px;z-index:300;display:flex;flex-direction:column;gap:8px;}
.toast{background:var(--surface);border:1px solid var(--bd2);border-left:3px solid var(--ac);border-radius:var(--radius-sm);
  padding:11px 15px;font-size:12.5px;font-weight:500;max-width:330px;box-shadow:var(--shadow);animation:tin .18s ease;}
.toast.green{border-left-color:var(--gn);}.toast.red{border-left-color:var(--rd);}
@keyframes tin{from{transform:translateY(8px);opacity:0;}to{transform:none;opacity:1;}}
.spin{animation:rot 1.1s linear infinite;}
@keyframes rot{to{transform:rotate(360deg);}}
@media(prefers-reduced-motion:reduce){.tt-app *{animation:none !important;transition:none !important;}}

@media(max-width:900px){
  .sidebar{width:66px;min-width:66px;padding:14px 8px;}
  .logo-name,.nav-item span:not(.cnt),.nav-seg,.cmdk-btn .label,.cmdk-btn .kbd,.sync-row span{display:none;}
  .nav-item{justify-content:center;}.cmdk-btn{justify-content:center;}
  .logo{justify-content:center;}
}
`;
