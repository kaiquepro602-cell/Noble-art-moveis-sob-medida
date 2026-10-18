import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for(const file of ['dist/index.html','dist/style.css','dist/app.js','dist/scroll-cue.css','dist/scroll-cue.js','dist/room-explorer.mjs','dist/room-explorer.css','dist/panorama-viewer.mjs','dist/panorama-math.mjs','dist/assets/sala-360-ia.webp','dist/assets/sala.webp','dist/assets/banheiro.webp','dist/assets/bancada.webp']){
  if(!existsSync(file))throw new Error(`Arquivo ausente: ${file}`);
}
execFileSync(process.execPath,['--check','dist/app.js'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','dist/scroll-cue.js'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','dist/room-explorer.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','dist/panorama-viewer.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['--check','dist/panorama-math.mjs'],{stdio:'inherit'});
console.log('Site estático pronto em dist/.');
