const overlay = document.getElementById("overlay");

function renderAllCharacters() {
  overlay.innerHTML = "";
  getCharacters()
    .filter(c => c.enabled)
    .forEach(c => {
      overlay.appendChild(createCharacterElement(c.id));
      updateCharacter(c.id);
    });
}

setInterval(() => {
  getCharacters()
    .filter(c => c.enabled)
    .forEach(c => updateCharacter(c.id));
}, REFRESH_INTERVAL);

renderAllCharacters();