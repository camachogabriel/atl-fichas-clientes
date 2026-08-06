// Copia los archivos estáticos de la app cliente a www/ para empaquetar con Capacitor.
// Correr con: npm run build:www  (o npm run sync:ios para copiar + sincronizar iOS)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

// Archivos y carpetas que forman parte de la app cliente empaquetada.
const FILES = ['index.html', 'app.html', 'clave.html', 'manifest.json'];
const DIRS = ['assets'];

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dest = path.join(WWW, rel);
  if (!fs.existsSync(src)) { console.warn('⚠️  No existe, se omite:', rel); return; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('✔', rel);
}

function copyDir(rel) {
  const src = path.join(ROOT, rel);
  const dest = path.join(WWW, rel);
  if (!fs.existsSync(src)) { console.warn('⚠️  No existe, se omite:', rel); return; }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log('✔', rel + '/');
}

fs.mkdirSync(WWW, { recursive: true });
FILES.forEach(copyFile);
DIRS.forEach(copyDir);
console.log('\nwww/ listo.');
