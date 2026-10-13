import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import pkg from '../package.json' with { type: 'json' };

const dirname = fileURLToPath(new URL('..', import.meta.url));

/** @type {string[]} */
const names = ['index'];
for (let name of Object.keys(pkg.exports)) {
	if (name === '.') continue;
	name = name.slice(2);
	if (name.split('/').length > 1) {
		console.error('Detected 2nd level sub package; only supports 1st for now...');
		process.exit(1);
	}
	names.push(name);
}
const ts = String.raw;
console.log('Emitting .d.ts files for publication purposes:');
for (const name of names) {
	const filepath = path.resolve(dirname, `${name}.d.ts`);
	console.log(`  - ${filepath}`);
	fs.writeFileSync(filepath, ts`import './types/index.js';`);
}
