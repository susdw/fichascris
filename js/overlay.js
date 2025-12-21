const overlay = document.getElementById('overlay');
if (!overlay) throw new Error('Overlay container missing');

// get id from ?id=XYZ
const params = new URLSearchParams(location.search);
const SHOW_NAME = params.get('name') !== '0';
const SHOW_PV   = params.get('pv') !== '0';
const SHOW_PD   = params.get('pd') !== '0';

const id = params.get('id');

if (!id) {
  overlay.innerHTML = '<div style="color:#999">Missing ?id</div>';
  throw new Error('Missing character id');
}

// create element
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

overlay.appendChild(el);

async function update() {
  updateCharacter(id);
}

update();
setInterval(update, REFRESH_INTERVAL);