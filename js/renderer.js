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

    let c;
    try {
      const chars = getCharacters?.() || [];
      c = chars.find(ch => ch.id === id);
    } catch {
      c = undefined;
    }

    // IMAGE (already worked)
    const imgEl = el.querySelector("img");
    if (c?.masked && c.maskedImage) {
      imgEl.src = c.maskedImage;
    } else {
      const useHurt =
        typeof data.currentPv !== 'undefined' &&
        typeof data.maxPv !== 'undefined' &&
        data.hurtImage &&
        data.currentPv <= Math.floor(data.maxPv / 2);

      imgEl.src = useHurt ? data.hurtImage : data.image;
    }

    // TEXT — ALWAYS UPDATE (OBS SAFE)
    const nameEl = el.querySelector('.name');
    const pvEl   = el.querySelector('.pv');
    const pdEl   = el.querySelector('.pd');

    if (nameEl) {
      if (c?.showName === false) {
        nameEl.innerText = '?';
      } else if (c?.masked) {
        const isFemale = firstName.toLowerCase().endsWith('a');
        nameEl.innerText = isFemale ? 'Percursora' : 'Percursor';
      } else {
        nameEl.innerText = firstName;
      }

      nameEl.style.color = c?.masked ? '#000' : 'rgb(255, 229, 229)';
    }

    if (pvEl) {
      pvEl.innerText = `${data.currentPv} / ${data.maxPv}`;
      pvEl.style.display = c?.showPv === false ? 'none' : '';
    }

    if (pdEl) {
      pdEl.innerText = `${data.currentPd}`;
      pdEl.style.display = c?.showPe === false ? 'none' : '';
    }

  } catch (err) {
    console.error("Error updating character", id, err);
  }
}