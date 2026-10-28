// Keep the small avatar in the existing private profile document: no Storage bucket needed.
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_AVATAR_LENGTH = 64 * 1024;
export async function prepareProfileImage(file: File): Promise<string> {
 if (!file.type.startsWith('image/')) throw new Error('Bitte wähle eine Bilddatei, zum Beispiel JPG oder PNG.');
 if (file.size > MAX_PHOTO_BYTES) throw new Error('Das Bild ist zu groß. Bitte wähle ein Bild mit höchstens 15 MB.');
 const url = URL.createObjectURL(file);
 try {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
   image.onload = () => resolve();
   image.onerror = () => reject(new Error('Dieses Bildformat konnte nicht geöffnet werden. Bitte verwende JPG, PNG oder WebP.'));
   image.src = url;
  });
  if (!image.naturalWidth || !image.naturalHeight) throw new Error('Das Bild konnte nicht gelesen werden.');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Die Bildverarbeitung ist in diesem Browser nicht verfügbar.');
  // Center crop and re-encode: consistent avatar, small payload, no original EXIF metadata.
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 320, 320);
  ctx.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 320, 320);
  for (const quality of [0.82, 0.65, 0.45, 0.25]) {
   const data = canvas.toDataURL('image/jpeg', quality);
   if (data.startsWith('data:image/jpeg;base64,') && data.length <= MAX_AVATAR_LENGTH) return data;
  }
  throw new Error('Das Bild konnte nicht ausreichend verkleinert werden. Bitte wähle ein anderes Bild.');
 } finally { URL.revokeObjectURL(url); }
}
