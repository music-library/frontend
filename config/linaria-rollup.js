/**
 * This file contains a Rollup loader for Linaria.
 * It uses the transform.ts function to generate class names from source code,
 * returns transformed code without template literals and attaches generated source maps
 */
import path from 'path';
import { createFilter } from '@rollup/pluginutils';
import { transform, slugify } from '@linaria/babel-preset';
import { createCustomDebug } from '@linaria/logger';
import { getFileIdx } from '@linaria/utils';
export default function linaria({
	include,
	exclude,
	sourceMap,
	preprocessor,
	...rest
} = {}) {
	const filter = createFilter(include, exclude);
	const cssLookup = {};
	let config;
	const codeCache = new Map();
	const resolveCache = new Map();
	const evalCache = new Map();
	return {
		name: 'linaria',

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},

		load(id) {
			return cssLookup[id];
		},

		/* eslint-disable-next-line consistent-return */
		resolveId(importee) {
			if (importee in cssLookup) return importee;
		},

		async transform(code, id) {
			// Do not transform ignored and generated files
			if (!filter(id) || id in cssLookup) return;
			const log = createCustomDebug('rollup', getFileIdx(id));
			log('rollup-init', id);

			const asyncResolve = async (what, importer) => {
				const resolved = await this.resolve(what, importer);

				if (resolved) {
					log('resolve', "✅ '%s'@'%s -> %O\n%s", what, importer, resolved); // Vite adds param like `?v=667939b3` to cached modules

					return resolved.id.split('?')[0];
				}

				log('resolve', "❌ '%s'@'%s", what, importer);
				throw new Error(`Could not resolve ${what}`);
			};

			const result = await transform(code, {
				filename: id,
				preprocessor,
				pluginOptions: rest
			}, asyncResolve, {}, resolveCache, codeCache, evalCache);
			if (!result.cssText) return;
			let {
				cssText
			} = result;
			const slug = slugify(cssText);
			const filename = `${id.replace(/\.[jt]sx?$/, '')}_${slug}.scss`;

			if (sourceMap && result.cssSourceMapText) {
				const map = Buffer.from(result.cssSourceMapText).toString('base64');
				cssText += `/*# sourceMappingURL=data:application/json;base64,${map}*/`;
			}

			cssLookup[filename] = cssText;

			if (config?.command === 'serve' && config?.root) {
				cssLookup[`/${path.posix.relative(config.root, filename)}`] = cssText;
			}

			result.code += `\nimport ${JSON.stringify(filename)};\n`;
			/* eslint-disable-next-line consistent-return */

			return {
				code: result.code,
				map: result.sourceMap
			};
		}

	};
}
