import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const assets=(await readdir('dist/assets')).map(f=>'/assets/'+f);
const files=['/','/icon.svg','/icon-192.png','/icon-512.png','/manifest.webmanifest',...assets];
const version=createHash('sha256').update(await readFile('dist/index.html')).digest('hex').slice(0,12);
let sw=await readFile('public/sw.js','utf8');sw=sw.replace("scorer-battle-v1",`scorer-battle-${version}`).replace("['/','/icon.svg','/manifest.webmanifest']",JSON.stringify(files));await writeFile('dist/sw.js',sw);
