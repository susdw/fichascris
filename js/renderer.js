function createCharacterElement(id) {
  const el = document.createElement("div");
  el.className = "character";
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

async function updateCharacter(id) {
  try {
    const data = await fetchCharacter(id);
    const el = document.getElementById(`char-${id}`);
    if (!el) return;

    const firstName = data.name.split(" ")[0];

    const imgEl = el.querySelector("img");
    const useHurt = (typeof data.currentPv !== 'undefined' && typeof data.maxPv !== 'undefined')
      && data.hurtImage && data.currentPv <= Math.floor(data.maxPv / 2);
    imgEl.src = useHurt ? data.hurtImage : data.image;
    
    // Respect show/hide settings stored in localStorage
    try {
      const chars = getCharacters();
      const c = chars.find(ch => ch.id === id);
      if (c) {
        const nameEl = el.querySelector('.name');
        const pvEl = el.querySelector('.pv');
        const pdEl = el.querySelector('.pd');
        if (nameEl) {
          nameEl.innerText = c.showName === false ? '?' : firstName;
        }
        if (pvEl) {
          pvEl.innerText = `${data.currentPv} / ${data.maxPv}`;
          pvEl.style.display = c.showPv === false ? 'none' : '';
        }
        if (pdEl) {
          pdEl.innerText = `${data.currentPd}`;
          pdEl.style.display = c.showPe === false ? 'none' : '';
        }
      }
    } catch (e) {
      // ignore if store not available
    }
  } catch (err) {
    console.error("Error updating character", id, err);
  }
}
