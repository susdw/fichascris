const form = document.getElementById("add-form");
const input = document.getElementById("character-id");
const list = document.getElementById("character-list");

form.onsubmit = async e => {
  e.preventDefault();
  const id = input.value.trim();
  if (!id) return;

  const data = await validateCharacter(id);
  if (!data) {
    return;
  }

  addCharacter({
    id,
    enabled: true
  });

  input.value = "";
  renderList();
};

async function renderList() {
  list.innerHTML = "Loading...";

  const chars = getCharacters();
  if (!chars.length) {
    list.innerHTML = "No characters added.";
    return;
  }

  list.innerHTML = "";

  for (const c of chars) {
    const row = document.createElement("div");
    row.className = "character-row";
    row.innerHTML = `
      <span>Loading...</span>
    `;
    list.appendChild(row);

    try {
      const data = await validateCharacter(c.id);

      row.innerHTML = `
        <img src="${data.image}" width="60">
        <strong>${data.name}</strong>

        <button onclick="toggle('${c.id}')">
          ${c.enabled ? "Disable" : "Enable"}
        </button>
        <button onclick="move('${c.id}', -1)">↑</button>
        <button onclick="move('${c.id}', 1)">↓</button>
        <button onclick="removeChar('${c.id}')">Remove</button>
        <strong>${data.id}</strong>
      `;
    } catch {
      row.innerHTML = `
        <strong>Invalid ID</strong>
        <span>${c.id}</span>
        <button onclick="removeChar('${c.id}')">Remove</button>
      `;
    }
  }
}

window.toggle = id => { toggleCharacter(id); renderList(); };
window.move = (id, d) => { moveCharacter(id, d); renderList(); };
window.removeChar = id => { removeCharacter(id); renderList(); };

renderList();