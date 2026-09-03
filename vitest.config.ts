import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			exclude: ['tests/**/*', 'prettier.config.js'],
		},
		setupFiles: ['./tests/setup.ts'],
		projects: [
			{
				extends: true,
				test: {
					include: ['**/*.unit.test.ts'],
					name: 'unit',
					environment: 'node',
				},
			},
			{
				extends: true,
				test: {
					include: ['**/*.int.test.ts'],
					name: 'integration',
					environment: 'node',
				},
			},
		],
	},
});
