/* eslint-disable jsdoc/reject-any-type */

/**
 * @template {import('unified').Plugin<any[], any>} P
 * @param {P} plugin
 * @param {Parameters<P>} settings
 * @returns {[P, Parameters<P>]}
 */
export function definePlugin(plugin, ...settings) {
	return [plugin, ...settings];
}
