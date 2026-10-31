const fs = require('node:fs');
const path = require('node:path');
const JSZip = require('jszip');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
const version = manifest.version.split('.').slice(0, 2).join('.');
const name = `ChatPDF-Compatto-v${version}`;
const zip = new JSZip();
for (const relative of fs.readdirSync(source, { recursive: true })) {
  const filename = path.join(source, relative);
  if (fs.statSync(filename).isFile()) zip.file(`${name}/${relative.replaceAll(path.sep, '/')}`, fs.readFileSync(filename));
}
(async () => {
  const output = path.join(root, 'output', `${name}.zip`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  const check = await JSZip.loadAsync(fs.readFileSync(output), { checkCRC32: true });
  for (const relative of manifest.content_scripts.flatMap(script => [...script.js, ...script.css])) {
    if (!check.file(`${name}/${relative}`)) throw new Error(`Missing packaged resource: ${relative}`);
  }
  if (manifest.background?.service_worker && !check.file(`${name}/${manifest.background.service_worker}`)) {
    throw new Error('Missing packaged background worker');
  }
  console.log(`Verified archive: ${output} (${fs.statSync(output).size} bytes)`);
})().catch(error => { console.error(error); process.exitCode = 1; });
