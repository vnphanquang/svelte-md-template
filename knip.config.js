import { defineConfig } from 'knip/config';

export default defineConfig({
	tags: ['-lintignore'],
	ignoreFiles: ['**/fixtures/**/*.{svelte,js}'],
	ignoreDependencies: ['@changesets/cli'],
	ignoreBinaries: ['lefthook'],
});
