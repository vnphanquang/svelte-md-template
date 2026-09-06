import { expect } from 'vitest';

function clean(str: string) {
	return str.replace(/^[\t\s]+/gm, '').replace(/[\t\s]+$/g, '').replace(/[\r\n]+/g, '');
}

expect.extend({
	toBeIgnoringNewlineAndIndentation(received: unknown, expected: string) {
		const { isNot } = this;
		const { matcherHint, printExpected, printReceived } = this.utils;

		if (typeof received !== 'string') {
			return {
				pass: false,
				message: () =>
					`${matcherHint('toBeIgnoringNewlineAndIndentation')}\n\nExpected received value to be a string, but got ${typeof received}`,
			};
		}

		const r = clean(received.trim());
		const e = clean(expected.trim());

		const pass = isNot ? r !== e : r === e;
		return {
			pass,
			message: () =>
				`${matcherHint('toBeIgnoringNewlineAndIndentation')}\n\n` +
				`Expected: ${isNot ? 'not ' : ''}${printExpected(expected)}\n` +
				`Received: ${printReceived(received)}`,
		};
	},
});
