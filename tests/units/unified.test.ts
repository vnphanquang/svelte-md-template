import { expect, test } from 'vitest';

import { definePlugin } from '../../src/unified';

test('definePlugin is exported', () => {
	expect(definePlugin).toBeDefined();
});
