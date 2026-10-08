import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const directory = new URL('../vendor/gyral/0.3.1-next.1/', import.meta.url);
const sums = await readFile(new URL('SHA256SUMS', directory), 'utf8');
for (const row of sums.trim().split('\n')) {
  const [expected, name] = row.trim().split(/\s+/);
  const actual = createHash('sha256').update(await readFile(new URL(name, directory))).digest('hex');
  if (actual !== expected) throw new Error(`Vendored Gyral checksum mismatch: ${name}. Restore the pinned artifact; do not rewrite its checksum.`);
}
console.log('Vendored Gyral checksums verified.');
