function characterUrl(id) {
  return `https://firestore.googleapis.com/v1/projects/cris-ordem-paranormal/databases/(default)/documents/characters/${id}`;
}

export async function fetchCharacter(id) {
  const res = await fetch(characterUrl(id), {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Fetch failed');

  const data = await res.json();
  const f = data.fields;

  return {
    id,
    name: f.name.stringValue,
    image: f.sheetPictureURL ? f.sheetPictureURL.stringValue : '',
    hurtImage: f.sheetPictureHurtURL ? f.sheetPictureHurtURL.stringValue : '',
    currentPv: Number(f.currentPv.integerValue),
    maxPv: Number(f.maxPv.integerValue),
    currentPd: Number(f.currentPd.integerValue),
  };
}

export async function validateCharacter(id) {
  const res = await fetch(characterUrl(id), {
    cache: 'no-store'
  });
  if (!res.ok) return null;

  const data = await res.json();
  const f = data.fields;

  return {
    id,
    name: f.name.stringValue,
    image: f.sheetPictureURL ? f.sheetPictureURL.stringValue : '',
    hurtImage: f.sheetPictureHurtURL ? f.sheetPictureHurtURL.stringValue : ''
  };
}
