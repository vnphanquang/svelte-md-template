// Copyright (c) Quang Phan. All rights reserved. Licensed under the MIT license.
/* eslint-disable jsdoc/reject-any-type */

/**
 * @param {TemplateStringsArray} strings
 * @param {any[]} values
 */
export function markdown(strings, ...values) {
	throw new Error(
		'This markdown template was not processed at build time. Make sure the vite plugin is set up correctly.',
		{ cause: { strings, values } },
	);
}
