const STORE_KEY = "overlay_characters";

function getCharacters() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveCharacters(chars) {
  localStorage.setItem(STORE_KEY, JSON.stringify(chars));
}

function addCharacter(char) {
  const chars = getCharacters();
  if (chars.some(c => c.id === char.id)) return;
  chars.push(char);
  saveCharacters(chars);
}

function removeCharacter(id) {
  saveCharacters(getCharacters().filter(c => c.id !== id));
}

function toggleCharacter(id) {
  const chars = getCharacters();
  const c = chars.find(c => c.id === id);
  if (c) c.enabled = !c.enabled;
  saveCharacters(chars);
}

function moveCharacter(id, dir) {
  const chars = getCharacters();
  const i = chars.findIndex(c => c.id === id);
  if (i < 0) return;

  const j = i + dir;
  if (j < 0 || j >= chars.length) return;

  [chars[i], chars[j]] = [chars[j], chars[i]];
  saveCharacters(chars);
}