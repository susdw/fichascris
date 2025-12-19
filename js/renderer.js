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

    el.querySelector("img").src = data.image;
    el.querySelector(".name").innerText = firstName ;
    el.querySelector(".pv").innerText =
      `${data.currentPv} / ${data.maxPv}`;
    el.querySelector(".pd").innerText =
      `${data.currentPd}`;

    // Respect show/hide settings stored in localStorage
    try {
      const chars = getCharacters();
      const c = chars.find(ch => ch.id === id);
      if (c) {
        const pvEl = el.querySelector('.pv');
        const pdEl = el.querySelector('.pd');
        if (pvEl) pvEl.style.display = c.showPv === false ? 'none' : '';
        if (pdEl) pdEl.style.display = c.showPe === false ? 'none' : '';
      }
    } catch (e) {
      // ignore if store not available
    }
  } catch (err) {
    console.error("Error updating character", id, err);
  }
}
