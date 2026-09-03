// Copyright (c) Quang Phan. All rights reserved. Licensed under the MIT license.

/**
 * @param {string} str
 */
export function markdown(str) {
	throw new Error(
		'This markdown template was not processed at build time. Make sure the vite plugin is set up correctly.',
		{ cause: str },
	);
}
