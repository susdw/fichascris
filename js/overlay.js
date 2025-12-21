// overlay.js
import { subscribeCharacters } from './store.js';
import { fetchCharacter } from './api.js'; // adjust path if needed

const overlay = document.getElementById('overlay');
if (!overlay) throw new Error('Overlay container missing');

// get id from query or pathname
const params = new URLSearchParams(location.search);
let id = params.get('id');
if (!id) {
  const parts = location.pathname.split('/').filter(Boolean);
  id = parts[parts.length - 1];
}
if (!id) {
  overlay.innerHTML = '<div style="padding:20px;color:#999">No character id in URL.</div>';
  throw new Error('Missing character id');
}

// ---------- CREATE ELEMENT ----------
function createCharacterElement(id) {
  const el = document.createElement('div');
  el.className = 'character';
  el.id = `char-${id}`;
  el.innerHTML = `
    <img>
    <div class="stats">
      <div class="name">Loading...</div>
      <div class="stat pv">-- / --</div>
      <div class="stat pd">--</div>
    </div>
  `;
  return el;
}

const el = createCharacterElement(id);
overlay.appendChild(el);

// ---------- STATE ----------
let charState = null;

// subscribe to Firebase changes
subscribeCharacters(chars => {
  charState = chars.find(c => c.id === id);
});

// ---------- UPDATE FUNCTION ----------
async function updateCharacter() {
  if (!charState) return; // wait until subscription provides value

  try {
    const data = await fetchCharacter(id);
    const firstName = data.name.split(" ")[0];

    // IMAGE
    const imgEl = el.querySelector('img');
    if (charState.masked && charState.maskedImage) {
      imgEl.src = charState.maskedImage;
    } else {
      const useHurt =
        typeof data.currentPv !== 'undefined' &&
        typeof data.maxPv !== 'undefined' &&
        data.hurtImage &&
        data.currentPv <= Math.floor(data.maxPv / 2);

      imgEl.src = useHurt ? data.hurtImage : data.image;
    }

    // TEXT / STATS
    const nameEl = el.querySelector('.name');
    const pvEl   = el.querySelector('.pv');
    const pdEl   = el.querySelector('.pd');

    if (nameEl) {
      if (charState.showName === false) {
        nameEl.innerText = '?';
      } else if (charState.masked) {
        const isFemale = firstName.toLowerCase().endsWith('a');
        nameEl.innerText = isFemale ? 'Percursora' : 'Percursor';
      } else {
        nameEl.innerText = firstName;
      }
      nameEl.style.color = charState.masked ? '#000' : 'rgb(255, 229, 229)';
    }

    if (pvEl) {
      pvEl.innerText = `${data.currentPv} / ${data.maxPv}`;
      pvEl.style.display = charState.showPv === false ? 'none' : '';
    }

    if (pdEl) {
      pdEl.innerText = `${data.currentPd}`;
      pdEl.style.display = charState.showPe === false ? 'none' : '';
    }

  } catch (err) {
    console.error('Error updating character', id, err);
  }
}

// ---------- INIT & INTERVAL ----------
updateCharacter();
setInterval(updateCharacter, typeof REFRESH_INTERVAL !== 'undefined' ? REFRESH_INTERVAL : 1000);