import { expect, test } from 'vitest';

import { markdown } from '../../src';

test('markdown template is exported', () => {
	expect(markdown).toBeDefined();
});

test('invoking markdown should throw', () => {
	expect(() => markdown('foo')).toThrow(
		'This markdown template was not processed at build time. Make sure the vite plugin is set up correctly.',
	);
});
