import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
await build({ entryPoints: ['src/app.js'], bundle: true, minify: true, format: 'esm', target: 'es2022', outfile: 'dist/app.js' });
const [html,css,js,font,favicon]=await Promise.all(['dist/index.html','dist/style.css','dist/app.js','dist/fonts/lab-sans.woff2','dist/favicon.svg'].map(p=>readFile(p)));
const licenses=await Promise.all(['dist/fonts/OFL.txt','dist/THREE-LICENSE.txt'].map(p=>readFile(p,'utf8')));
const standalone=html.toString().replace('</head>',()=>'<meta name="offline-copy" content="All lesson assets embedded; external source links require internet"><!--\n'+licenses.join('\n\n').replaceAll('--','—')+'\n--></head>')
  .replace('<link rel="stylesheet" href="./style.css">',()=>'<style>'+css.toString().replace("url('./fonts/lab-sans.woff2')",'url(data:font/woff2;base64,'+font.toString('base64')+')')+'</style>')
  .replace('href="./favicon.svg"','href="data:image/svg+xml;base64,'+favicon.toString('base64')+'"')
  .replace('<script type="module" src="./app.js"></script>',()=>'<script type="module">'+js.toString().replaceAll('</script','<\\/script')+'</script>');
await writeFile('dist/fraction-lab-offline.html',standalone);
console.log('Built Fraction Lab. All 3D dependencies bundled locally.');
