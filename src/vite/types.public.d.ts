/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Root } from 'mdast';
import type { PluggableList, Processor } from 'unified';

export type FilterIdSpecs = (string | RegExp)[] | string | RegExp;

export type SvelteMdTemplateTransformerUnifiedWithPlugins = {
	type: 'unified';
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
};
export type SvelteMdTemplateTransformerUnified = {
	type: 'unified';
	processor: Processor<Root, any, any, any, any>;
};
export type SvelteMdTemplateTransformerCustom = {
	type: 'custom';
	/**
	 * take input as an array of markdown content as they appear from the original Svelte file,
	 * and expect an array of HTML string output, in the same order
	 */
	transform: (templates: string[]) => string[] | Promise<string[]>;
};

type SvelteMdTemplateTransformer =
	| SvelteMdTemplateTransformerUnifiedWithPlugins
	| SvelteMdTemplateTransformerUnified
	| SvelteMdTemplateTransformerCustom;

/**
 * configure the svelte-md-template vite plugin
 */
export interface SvelteMdTemplateOptions {
	/** what files the vite plugin should process, passed to Vite `transform.filter.id.include` */
	include?: FilterIdSpecs;
	/** what files the vite plugin should skip, passed to Vite `transform.filter.id.exclude` */
	exclude?: FilterIdSpecs;
	/** configure how markdown is transformed */
	transformer?: SvelteMdTemplateTransformer;
	/**
	 * name of the package / alias used in the tag imports
	 *
	 * @default 'svelte-md-template'
	 */
	importSource?: string;
}
