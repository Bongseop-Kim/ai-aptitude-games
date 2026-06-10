#!/usr/bin/env node
// Decode "standalone" prototype HTML bundles into readable source files.
// Each bundle embeds a <script type="__bundler/manifest"> map of
//   UUID -> { mime, compressed(gzip), data(base64) }
// Usage: node _decode.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORIGINALS = path.join(__dirname, '_originals');

const SOURCES = [
  { file: '새움 게임 플로우 (standalone).html', out: 'game-flow' },
  { file: '새움 프로토타입 (standalone).html', out: 'prototype' },
  { file: '새움 화면 보드 (standalone).html', out: 'screen-board' },
  { file: '모의고사 화면 플로우 (standalone).html', out: 'mock-exam-flow' },
  { file: '실전 면접 트랙 (오프라인).html', out: 'interview-track' },
];

const EXT = {
  'text/javascript': 'js',
  'application/javascript': 'js',
  'text/jsx': 'jsx',
  'text/babel': 'jsx',
  'text/css': 'css',
  'text/html': 'html',
  'application/json': 'json',
  'image/svg+xml': 'svg',
};
const SKIP_MIME = /^(font|image)\//; // binary assets we don't need to read

function extract(html, type) {
  const m = html.match(
    new RegExp(`<script type="${type}">\\s*([\\s\\S]*?)</script>`)
  );
  return m ? m[1] : null;
}

function decodeBundle({ file, out }) {
  const src = path.join(ORIGINALS, file);
  const html = fs.readFileSync(src, 'utf8');
  const manifestRaw = extract(html, '__bundler/manifest');
  const templateRaw = extract(html, '__bundler/template');
  if (!manifestRaw) {
    console.error(`! no manifest in ${file}`);
    return;
  }
  const manifest = JSON.parse(manifestRaw);
  const outDir = path.join(__dirname, out);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const vendorDir = path.join(outDir, '_vendor');
  const index = [];
  const usedNames = new Set();

  for (const [id, res] of Object.entries(manifest)) {
    const { mime, compressed, data } = res;
    if (SKIP_MIME.test(mime)) {
      index.push({ id, mime, skipped: true });
      continue;
    }
    let buf = Buffer.from(data, 'base64');
    if (compressed) {
      try {
        buf = zlib.gunzipSync(buf);
      } catch {
        try {
          buf = zlib.inflateSync(buf);
        } catch (e) {
          console.error(`  ! decompress failed ${id}: ${e.message}`);
        }
      }
    }
    const ext = EXT[mime] || 'txt';
    const text = buf.toString('utf8', 0, 200);

    // App source files start with `// <name>.jsx — ...`
    const named = text.match(/^\/\/\s*([a-z0-9][\w-]*)\.(jsx?|tsx?)\b/i);
    const scaffold = /^\/\/\s*@ds-adherence-ignore/.test(text);

    let name, isApp;
    if (named) {
      name = `${named[1]}.${named[2]}`;
      isApp = true;
    } else if (scaffold) {
      name = 'entry-scaffold.jsx';
      isApp = true;
    } else {
      name = `vendor-${id.slice(0, 8)}.${ext}`;
      isApp = false;
    }
    // de-dupe
    let finalName = name;
    let n = 2;
    while (usedNames.has(finalName)) {
      const dot = name.lastIndexOf('.');
      finalName = `${name.slice(0, dot)}-${n++}${name.slice(dot)}`;
    }
    usedNames.add(finalName);

    const targetDir = isApp ? outDir : vendorDir;
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, finalName), buf);
    index.push({ id, mime, bytes: buf.length, file: finalName, app: isApp });
  }

  if (templateRaw) {
    fs.writeFileSync(path.join(outDir, '_template.html'), templateRaw);
  }
  fs.writeFileSync(
    path.join(outDir, '_index.json'),
    JSON.stringify({ source: file, resources: index }, null, 2)
  );
  const app = index.filter((r) => r.app);
  const vendor = index.filter((r) => !r.app && !r.skipped);
  console.log(
    `✓ ${out}: ${app.length} app files, ${vendor.length} vendor, ${
      index.length - app.length - vendor.length
    } binary skipped`
  );
  console.log('   ' + app.map((r) => r.file).join(', '));
}

const only = process.argv.slice(2);
for (const s of SOURCES) {
  if (only.length && !only.includes(s.out)) continue;
  decodeBundle(s);
}
