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
  try {
    const data = await fetchCharacter(id);

    const imgEl = el.querySelector('img');
    const useHurt = (typeof data.currentPv !== 'undefined' && typeof data.maxPv !== 'undefined')
      && data.hurtImage && data.currentPv <= Math.floor(data.maxPv / 2);
    imgEl.src = useHurt ? data.hurtImage : data.image;

    const nameEl = el.querySelector('.name');
    const pvEl = el.querySelector('.pv');
    const pdEl = el.querySelector('.pd');

    if (SHOW_NAME) {
      nameEl.textContent = data.name.split(' ')[0];
    } else {
      nameEl.textContent = '?';
    }

    if (SHOW_PV) {
      pvEl.textContent = `${data.currentPv} / ${data.maxPv}`;
      pvEl.style.display = '';
    } else {
      pvEl.style.display = 'none';
    }

    if (SHOW_PD) {
      pdEl.textContent = data.currentPd;
      pdEl.style.display = '';
    } else {
      pdEl.style.display = 'none';
    }

  } catch (e) {
    console.error(e);
  }
}

update();
setInterval(update, REFRESH_INTERVAL);