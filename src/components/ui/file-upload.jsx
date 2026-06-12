"use client";

/* File Upload — composant 21st.dev adapté :
   - converti TS → JS, monochrome (tokens shadcn), libellés FR
   - branché sur le stockage persistant de l'app : `files` = fichiers déjà en
     mémoire (base64), `onAdd(fileObjs)` à l'upload, `onRemove(id)`.
   - la progression reflète la lecture réelle du fichier (FileReader). */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, File as FileIcon, Trash2, CheckCircle, Download } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { uid, fmtSize } from "../../lib/core.js";
import PixelCanvas from "./pixel-canvas.jsx";

function readWithProgress(file, onProgress) {
  return new Promise((res) => {
    const base = { id: uid(), name: file.name, size: file.size, type: file.type, ts: Date.now(), content: null };
    if (file.size >= 1800000) { onProgress(100); res(base); return; }
    const r = new FileReader();
    r.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    r.onload = () => { onProgress(100); res({ ...base, content: r.result }); };
    r.onerror = () => { onProgress(100); res(base); };
    r.readAsDataURL(file);
  });
}

export default function FileUpload({ files = [], onAdd, onRemove, targetLabel, hint }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = async (fileList) => {
    const list = Array.from(fileList);
    if (!list.length) return;
    const items = list.map((f) => ({ key: uid(), name: f.name, progress: 0 }));
    setPending((p) => [...p, ...items]);
    const results = await Promise.all(list.map((f, i) =>
      readWithProgress(f, (pct) => setPending((p) => p.map((x) => x.key === items[i].key ? { ...x, progress: pct } : x)))
    ));
    setTimeout(() => setPending((p) => p.filter((x) => !items.some((it) => it.key === x.key))), 450);
    onAdd(results);
  };

  return (
    <div className="w-full">
      {/* Zone de dépôt + pixel shimmer (composant 21st.dev, uniquement ici) */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current && inputRef.current.click()}
        initial={false}
        animate={{ scale: isDragging ? 1.015 : 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center transition-colors hover:bg-secondary/70",
          isDragging && "border-foreground bg-secondary ring-2 ring-ring/40"
        )}
      >
        <PixelCanvas gap={6} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div animate={{ y: isDragging ? [-4, 0, -4] : 0 }} transition={{ duration: 1.4, repeat: isDragging ? Infinity : 0, ease: "easeInOut" }}>
            <UploadCloud className={cn("h-12 w-12 transition-colors", isDragging ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
          </motion.div>
          <div className="space-y-1.5">
            <h3 className="text-[16px] font-semibold">
              {isDragging ? "Lâche pour mémoriser" : "Dépose un fichier dans la mémoire"}
            </h3>
            <p className="text-[13.5px] text-muted-foreground">
              {isDragging
                ? "Il sera rangé et tracé automatiquement"
                : <>Glisse-dépose ici, ou <span className="font-medium text-foreground underline-offset-4 group-hover:underline">parcours</span>{targetLabel && <> · rangé dans <span className="font-medium text-foreground">{targetLabel}</span></>}</>}
            </p>
            {hint && <p className="text-[12px] text-muted-foreground/80">{hint}</p>}
          </div>
          <input ref={inputRef} type="file" multiple hidden onChange={(e) => { if (e.target.files.length) { handleFiles(e.target.files); e.target.value = ""; } }} />
        </div>
      </motion.div>

      {/* Lectures en cours */}
      <AnimatePresence>
        {pending.map((p) => (
          <motion.div key={p.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mt-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="truncate font-medium">{p.name}</span>
              <span className="font-mono text-[12px] text-muted-foreground">{p.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full rounded-full bg-foreground" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Fichiers mémorisés */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {files.map((f) => (
              <motion.div key={f.id}
                initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="flex items-center gap-3.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                {f.content && (f.type || "").startsWith("image/") ? (
                  <img src={f.content} alt={f.name} className="h-11 w-11 flex-none rounded-lg border border-border object-cover" />
                ) : (
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-lg border border-border bg-card"><FileIcon className="h-5 w-5 text-muted-foreground" /></span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-medium" title={f.name}>{f.name}</span>
                    <CheckCircle className="h-3.5 w-3.5 flex-none text-emerald-500" />
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">{fmtSize(f.size)}{f.where ? ` · ${f.where}` : ""}{!f.content && " · >1,8 Mo : référence seule"}</div>
                </div>
                {f.content && (
                  <a href={f.content} download={f.name} onClick={(e) => e.stopPropagation()}
                    className="grid h-8 w-8 flex-none place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" title="Télécharger">
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {onRemove && (
                  <button onClick={() => onRemove(f)} className="grid h-8 w-8 flex-none place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive" title="Retirer de la mémoire">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
