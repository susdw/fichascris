// stream.js - renders a single character overlay based on the final path segment
(function(){
  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  // get id from query or from pathname: support both /character/stream/?id=ID and /character/stream/ID/
  const urlParams = new URLSearchParams(location.search);
  let id = urlParams.get('id');
  if (!id) {
    const parts = location.pathname.split('/').filter(Boolean);
    id = parts[parts.length - 1];
  }
  if (!id) {
    overlay.innerHTML = '<div style="padding:20px;color:#999">No character id in URL.</div>';
    return;
  }

  // create and append the single character element
  const el = createCharacterElement(id);
  overlay.appendChild(el);
  updateCharacter(id);

  // keep updating
  setInterval(() => updateCharacter(id), typeof REFRESH_INTERVAL !== 'undefined' ? REFRESH_INTERVAL : 1000);
})();
