// Prüft die Fotoseite vor dem Veröffentlichen (lokal und in der GitHub Action):
// alben.json ist gültig, jedes Foto hat seine Webfassungen, keine Datei enthält noch Metadaten-Kennungen für GPS.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const seite = fileURLToPath(new URL('./seite/', import.meta.url));
const fehler = [];
const { alben } = JSON.parse(readFileSync(join(seite, 'alben.json'), 'utf8'));
if (!Array.isArray(alben) || !alben.length) fehler.push('alben.json enthält keine Alben.');
const ids = new Set();
let fotos = 0, bytes = 0;
for (const a of alben) {
  if (!/^[a-z0-9-]+$/.test(a.id) || ids.has(a.id)) fehler.push(`Album-ID ungültig oder doppelt: ${a.id}`);
  ids.add(a.id);
  if (!a.titel || !Array.isArray(a.fotos) || !a.fotos.length) fehler.push(`Album ${a.id}: Titel oder Fotos fehlen.`);
  for (const f of a.fotos ?? []) {
    fotos++;
    if (!/^[a-z0-9-]+$/.test(f.datei) || !(f.b > 0) || !(f.h > 0)) fehler.push(`${a.id}/${f.datei}: Eintrag unvollständig.`);
    for (const art of ['gross', 'klein']) {
      const p = join(seite, 'alben', a.id, art, f.datei + '.jpg');
      if (!existsSync(p)) { fehler.push(`fehlt: alben/${a.id}/${art}/${f.datei}.jpg`); continue; }
      const daten = readFileSync(p);
      bytes += daten.length;
      // JPEG ohne APP1-Block (EXIF/XMP) → keine GPS-Daten
      if (daten.includes(Buffer.from('Exif\0\0')) || daten.includes(Buffer.from('http://ns.adobe.com/xap/'))) fehler.push(`Metadaten enthalten: alben/${a.id}/${art}/${f.datei}.jpg`);
    }
  }
}
for (const d of ['index.html', 'app.js', 'style.css']) if (!existsSync(join(seite, d)) || !statSync(join(seite, d)).size) fehler.push(`fehlt: ${d}`);
if (fehler.length) { console.error('SEITE: FEHLER\n  ' + fehler.slice(0, 20).join('\n  ')); process.exit(1); }
console.log(`SEITE: in Ordnung – ${alben.length} Alben, ${fotos} Fotos, ${(bytes / 1e6).toFixed(0)} MB`);
