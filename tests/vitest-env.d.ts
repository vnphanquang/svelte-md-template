/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'vitest' {
	interface Assertion<T = any> {
		/** Asserts that a string matches another string ignoring line breaks (\r and \n) and indentation */
		toBeIgnoringNewlineAndIndentation(expected: string): T;
	}
}

export {};
