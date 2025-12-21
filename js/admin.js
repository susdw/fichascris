const form = document.getElementById("add-form");
const input = document.getElementById("character-id");
const list = document.getElementById("character-list");
const searchInput = document.getElementById('search-name');
const btnGrid = document.getElementById('btn-grid');
const btnList = document.getElementById('btn-list');

// render token used to ignore outdated async renders (prevents duplicates)
let renderToken = 0;

// admin view state: 'grid' or 'list'
let adminView = localStorage.getItem('adminView') || 'grid';

function setAdminView(v) {
  adminView = v;
  localStorage.setItem('adminView', v);
  if (!list) return;
  if (v === 'list') list.classList.add('list-view'); else list.classList.remove('list-view');
  // visual feedback for buttons
  if (btnGrid) btnGrid.style.opacity = v === 'grid' ? '1' : '0.6';
  if (btnList) btnList.style.opacity = v === 'list' ? '1' : '0.6';
  if (btnGrid) btnGrid.classList.toggle('active', v === 'grid');
  if (btnList) btnList.classList.toggle('active', v === 'list');
}

if (btnGrid) btnGrid.addEventListener('click', () => setAdminView('grid'));
if (btnList) btnList.addEventListener('click', () => setAdminView('list'));
if (searchInput) searchInput.addEventListener('input', () => renderList());

// initialize view
setAdminView(adminView);

form.onsubmit = async e => {
  e.preventDefault();
  const id = input.value.trim();
  if (!id) return;

  const data = await validateCharacter(id);
  if (!data) {
    return;
  }

  addCharacter({ id, enabled: true, showName: true, showPv: true, showPe: true });
  input.value = '';
  renderList();
};

async function renderList() {
  if (!list) return;

  const chars = getCharacters();
  const filter = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';

  // token for this render; any async results from older tokens will be ignored
  const token = ++renderToken;

  const frag = document.createDocumentFragment();
  let matchedCount = 0;

  for (const c of chars) {
    const row = document.createElement("div");
    row.className = "character-row";
    row.draggable = true;
    row.dataset.id = c.id;
    row.innerHTML = `<span>Loading...</span>`;

    try {
      const data = await validateCharacter(c.id);

      // if a newer render started, abort applying this result
      if (token !== renderToken) return;

      // apply name filter (if any)
      if (filter) {
        const name = (data && data.name) ? data.name.toLowerCase() : '';
        if (!name.includes(filter)) {
          continue;
        }
      }

      row.innerHTML = `
        <img src="${data.image}" width="100%">
        <div class="character-info">
          <strong>${data.name}</strong>
          <span class="character-id">${data.id}</span>
        </div>
        <div class="character-controls">
          <button onclick="toggleName('${c.id}')" title="Toggle Name">
            <i class="bi ${c.showName ? 'bi-eye-fill' : 'bi-eye-slash-fill'}"></i> Nam
          </button>
          <button onclick="togglePV('${c.id}')" title="Toggle PV">
            <i class="bi ${c.showPv ? 'bi-eye-fill' : 'bi-eye-slash-fill'}"></i> PV
          </button>
          <button onclick="togglePE('${c.id}')" title="Toggle PE">
            <i class="bi ${c.showPe ? 'bi-eye-fill' : 'bi-eye-slash-fill'}"></i> PD
          </button>
          <button class="overlaybutton" onclick="window.open('character/stream/?id=${c.id}','_blank')" title="Open Overlay">
            <i class="bi bi-box-arrow-up-right"></i> Stream
          </button>
        </div>
        <div class="character-controls">
          <button onclick="maskChar('${c.id}')" title="Mask">
            <i class="bi ${c.masked ? 'bi-toggle-on' : 'bi-toggle-off'}"></i> Máscara
          </button>
          <button onclick="removeChar('${c.id}')" title="Remove">
            <i class="bi bi-trash-fill"></i> Del
          </button>
        </div>
      `;

      // drag handlers for this row
      row.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', c.id);
        row.classList.add('dragging');
        
        // create a custom drag image from the character image
        const img = row.querySelector('img');
        if (img) {
          const dragImg = new Image();
          dragImg.src = img.src;
          e.dataTransfer.setDragImage(dragImg, 60, 60);
        }
        e.dataTransfer.effectAllowed = 'move';
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        // clear any drop indicators
        const dropInd = document.querySelector('.drop-indicator');
        if (dropInd) dropInd.remove();
      });

      frag.appendChild(row);
      matchedCount++;
    } catch {
      if (token !== renderToken) return;

      if (filter && !(c.id && c.id.toLowerCase().includes(filter))) {
        continue;
      }

      row.innerHTML = `
        <div style="text-align: center; width: 100%;">
          <strong style="color: #ff3333;">Invalid ID</strong>
          <div style="font-size: 12px; color: #999;">${c.id}</div>
        </div>
        <button onclick="removeChar('${c.id}')" style="width: 100%;">
          <i class="bi bi-trash-fill"></i> Remove
        </button>
      `;

      frag.appendChild(row);
      matchedCount++;
    }
  }

  // if no matches, show message
  if (matchedCount === 0) {
    list.innerHTML = '<div style="padding:18px;color:#999;text-align:center;">No characters match your search.</div>';
    return;
  }

  // apply fragment only if this is still the latest render
  if (token === renderToken) {
    list.innerHTML = '';
    list.appendChild(frag);
  }
}


// drag helpers attached to container
function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('.character-row:not(.dragging)')];
  const isListView = list.classList.contains('list-view');

  if (isListView) {
    // in list view, use vertical positioning (Y axis)
    const result = draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null });
    return result.element;
  } else {
    // in grid view, find closest element and determine if we drop before or after
    const result = draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offsetX = x - box.left - box.width / 2;
      const offsetY = y - box.top - box.height / 2;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (distance < closest.distance) {
        return { distance: distance, element: child, offsetX, offsetY };
      } else {
        return closest;
      }
    }, { distance: Number.POSITIVE_INFINITY, element: null, offsetX: 0, offsetY: 0 });
    
    // determine if drop should be before or after the closest element
    if (!result.element) return null;
    
    // if hovering in right or bottom half of element, return the next sibling (drop after)
    // otherwise return current element (drop before)
    const nextSibling = result.element.nextElementSibling?.classList?.contains('character-row') 
      ? result.element.nextElementSibling 
      : null;
    
    if ((result.offsetX > 0 || result.offsetY > 0) && nextSibling) {
      return nextSibling;
    }
    
    return result.element;
  }
}

function showDropIndicator(afterEl, isListView) {
  // remove any existing indicator
  const existing = document.querySelector('.drop-indicator');
  if (existing) existing.remove();
  
  if (!afterEl) {
    // insert at end if no element found
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    if (!isListView) indicator.classList.add('grid-mode');
    list.appendChild(indicator);
    return;
  }
  
  const indicator = document.createElement('div');
  indicator.className = 'drop-indicator';
  if (!isListView) indicator.classList.add('grid-mode');
  
  if (isListView) {
    // for list view, insert before the element and let absolute positioning handle it
    const box = afterEl.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    indicator.style.top = (box.top - listBox.top) + 'px';
  } else {
    // for grid view, position at the element's left edge
    const box = afterEl.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    indicator.style.left = (box.left - listBox.left) + 'px';
  }
  
  list.appendChild(indicator);
}

if (list) {
  list.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // show visual indicator of where drop will occur
    const isListView = list.classList.contains('list-view');
    const afterEl = getDragAfterElement(list, e.clientX, e.clientY);
    showDropIndicator(afterEl, isListView);
  });

  list.addEventListener('dragleave', e => {
    // only clear if we truly left the container
    if (e.target === list || !list.contains(e.relatedTarget)) {
      const indicator = document.querySelector('.drop-indicator');
      if (indicator) indicator.remove();
    }
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const isListView = list.classList.contains('list-view');
    const afterEl = getDragAfterElement(list, e.clientX, e.clientY);
    
    // clear indicator
    const indicator = document.querySelector('.drop-indicator');
    if (indicator) indicator.remove();
    
    if (id) {
      // Get the target index based on the FULL character list, not filtered view
      const fullChars = getCharacters();
      let toIndex;
      if (afterEl) {
        const afterId = afterEl.dataset.id;
        toIndex = fullChars.findIndex(c => c.id === afterId);
      } else {
        toIndex = fullChars.length;
      }
      
      reorderCharacter(id, toIndex);
      renderList();
    }
  });
}

window.toggle = id => { toggleCharacter(id); renderList(); };
window.move = (id, d) => { moveCharacter(id, d); renderList(); };
window.removeChar = id => { removeCharacter(id); renderList(); };
window.togglePV = id => { toggleCharacterPV(id); renderList(); };
window.togglePE = id => { toggleCharacterPE(id); renderList(); };
window.toggleName = id => { toggleCharacterName(id); renderList(); };
window.maskChar = id => { maskCharacter(id); renderList(); };

// Export a static stream page for the given id (prompts download). Save as character/stream/<id>/index.html
window.exportStream = function(id) {
  const content = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Stream - ${id}</title>
  <link rel="stylesheet" href="../../../css/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body>
  <a href="../../../admin.html" class="nav-btn" title="Back to Admin">
    <i class="bi bi-arrow-left"></i> Admin
  </a>
  <div class="overlay-wrapper">
    <div id="overlay" class="characters-grid"></div>
  </div>
  <script src="../../../js/config.js"></script>
  <script src="../../../js/store.js"></script>
  <script src="../../../js/api.js"></script>
  <script src="../../../js/renderer.js"></script>
  <script>
    (function(){
      const id = '${id}';
      const overlay = document.getElementById('overlay');
      const el = createCharacterElement(id);
      overlay.appendChild(el);
      updateCharacter(id);
      setInterval(() => updateCharacter(id), typeof REFRESH_INTERVAL !== 'undefined' ? REFRESH_INTERVAL : 1000);
    })();
  </script>
</body>
</html>`;

  const blob = new Blob([content], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${id}-stream.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
};

renderList();