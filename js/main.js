const overlay = document.getElementById("overlay");

function renderAllCharacters() {
  overlay.innerHTML = "";

  const enabled = getCharacters().filter(c => c.enabled);

  // Place characters into rows of max 4, and distribute each row's items
  // across the 4 grid columns so they appear equally spaced.
  for (let rowStart = 0; rowStart < enabled.length; rowStart += 4) {
    const chunk = enabled.slice(rowStart, rowStart + 4);
    const m = chunk.length;
    for (let i = 0; i < m; i++) {
      const c = chunk[i];
      const el = createCharacterElement(c.id);
      // for incomplete rows, align left-to-right; for full rows (m=4), distribute evenly
      let col;
      if (m === 4) {
        // full row: distribute evenly across all 4 columns
        col = Math.round(i * 3 / 3);
      } else {
        // incomplete row: place left-to-right starting from column 0
        col = i;
      }
      el.style.gridColumn = `${col + 1}`;
      overlay.appendChild(el);
      updateCharacter(c.id);
    }
  }
}

setInterval(() => {
  getCharacters()
    .filter(c => c.enabled)
    .forEach(c => updateCharacter(c.id));
}, REFRESH_INTERVAL);

renderAllCharacters();