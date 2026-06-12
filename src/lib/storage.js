/* Adaptateur de stockage :
   - Si VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY sont définis → Supabase (cloud,
     multi-appareils, espace partagé synchronisé, données + activité durables).
   - Sinon → localStorage (l'app fonctionne, mais les données restent dans ce navigateur). */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supa = url && anon ? createClient(url, anon) : null;
export const cloudEnabled = !!supa;

export async function kvGet(key) {
  if (supa) {
    const { data, error } = await supa.from("kv").select("value").eq("key", key).maybeSingle();
    if (error) { console.error("kvGet", error); return null; }
    return data ? data.value : null;
  }
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}

export async function kvSet(key, value) {
  if (supa) {
    const { error } = await supa.from("kv").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) { console.error("kvSet", error); return false; }
    return true;
  }
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export async function kvDel(key) {
  if (supa) { await supa.from("kv").delete().eq("key", key); return; }
  try { localStorage.removeItem(key); } catch {}
}

/* Sauvegarde miroir locale (filet de sécurité contre l'éviction navigateur en mode local). */
export function mirrorBackup(key, value) {
  try { localStorage.setItem(key + ":backup", JSON.stringify({ ts: Date.now(), value })); } catch {}
}
export function readMirror(key) {
  try { const v = localStorage.getItem(key + ":backup"); return v ? JSON.parse(v).value : null; }
  catch { return null; }
}
