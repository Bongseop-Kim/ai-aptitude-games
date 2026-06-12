#!/usr/bin/env node
// Creates a Supabase migration file whose version is guaranteed to sort after
// every existing migration. Plain `date -u` / `supabase migration new` stamps
// the current time, which `supabase db push` rejects as out-of-order whenever
// an existing migration carries a later (e.g. hand-written) timestamp.
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const name = process.argv[2];

if (!name || !/^[a-z0-9_]+$/.test(name)) {
  console.error('Usage: npm run migration:new <name>');
  console.error('The name must contain only lowercase letters, numbers, and underscores.');
  process.exit(1);
}

const migrationsDir = path.join(import.meta.dirname, '..', 'supabase', 'migrations');

function parseVersionMs(version) {
  const year = Number(version.slice(0, 4));
  const month = Number(version.slice(4, 6));
  const day = Number(version.slice(6, 8));
  const hours = Number(version.slice(8, 10));
  const minutes = Number(version.slice(10, 12));
  const seconds = Number(version.slice(12, 14));
  return Date.UTC(year, month - 1, day, hours, minutes, seconds);
}

function formatVersion(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join('');
}

const versions = readdirSync(migrationsDir)
  .map((file) => file.match(/^(\d{14})_/)?.[1])
  .filter(Boolean)
  .sort();
const latest = versions.at(-1);

let stamp = new Date();
if (latest && parseVersionMs(latest) >= stamp.getTime()) {
  stamp = new Date(parseVersionMs(latest) + 60_000);
}

const filePath = path.join(migrationsDir, `${formatVersion(stamp)}_${name}.sql`);
writeFileSync(filePath, '', { flag: 'wx' });
console.log(`Created ${path.relative(process.cwd(), filePath)}`);
