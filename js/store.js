import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const STORE_REF = ref(db, "overlay_characters");
const BASE_PATH = '/fichascris';

/* ---------- READ ---------- */

export async function getCharacters() {
  const snap = await get(STORE_REF);
  if (!snap.exists()) return [];
  return Object.values(snap.val());
}

/* ---------- WRITE ---------- */

function saveCharacters(chars) {
  const obj = {};
  chars.forEach(c => (obj[c.id] = c));
  set(STORE_REF, obj);
}

/* ---------- REALTIME SYNC (OBS + BROWSER) ---------- */

export function subscribeCharacters(cb) {
  onValue(STORE_REF, snap => {
    if (!snap.exists()) return cb([]);
    cb(Object.values(snap.val()));
  });
}

/* ---------- MUTATORS ---------- */

export async function addCharacter(char) {
  const chars = await getCharacters();
  if (chars.some(c => c.id === char.id)) return;
  chars.push(char);
  saveCharacters(chars);
}

export async function removeCharacter(id) {
  const chars = await getCharacters();
  saveCharacters(chars.filter(c => c.id !== id));
}

export async function maskCharacter(id) {
  const chars = await getCharacters();
  const c = chars.find(c => c.id === id);
  if (!c) return;

  c.masked = !c.masked;
  c.maskedImage = `${BASE_PATH}/assets/images/${id}.png`;
  saveCharacters(chars);
}

export async function toggleCharacterPV(id) {
  const chars = await getCharacters();
  const c = chars.find(c => c.id === id);
  if (!c) return;
  c.showPv = !c.showPv;
  saveCharacters(chars);
}

export async function toggleCharacterPE(id) {
  const chars = await getCharacters();
  const c = chars.find(c => c.id === id);
  if (!c) return;
  c.showPe = !c.showPe;
  saveCharacters(chars);
}

export async function toggleCharacterName(id) {
  const chars = await getCharacters();
  const c = chars.find(c => c.id === id);
  if (!c) return;
  c.showName = !c.showName;
  saveCharacters(chars);
}

export async function reorderCharacter(id, toIndex) {
  const chars = await getCharacters();
  const from = chars.findIndex(c => c.id === id);
  if (from < 0) return;

  const [item] = chars.splice(from, 1);
  chars.splice(toIndex, 0, item);
  saveCharacters(chars);
}