function characterUrl(id) {
  return `https://firestore.googleapis.com/v1/projects/cris-ordem-paranormal/databases/(default)/documents/characters/${id}`;
}

async function fetchCharacter(id) {
  const res = await fetch(characterUrl(id));
  const data = await res.json();
  const f = data.fields;

  return {
    id,
    name: f.name.stringValue,
    image: f.sheetPictureURL.stringValue,
    currentPv: parseInt(f.currentPv.integerValue),
    maxPv: parseInt(f.maxPv.integerValue),
    currentPd: parseInt(f.currentPd.integerValue)
  };
}

async function validateCharacter(id) {
  const res = await fetch(characterUrl(id));
  if (!res.ok) return null;

  const data = await res.json();
  const f = data.fields;

  return {
    id,
    name: f.name.stringValue,
    image: f.sheetPictureURL.stringValue
  };
}

