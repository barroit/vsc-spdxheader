/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import { isMatch as picomatch_test } from 'picomatch'

import { vsc_warn } from './vsc.js'

function warn_deprecated(old, __new)
{
	vsc_warn(`${old} is deprecated and ignored, use ${__new} instead`)
}

function resolve_shebang(conf, lang, suffix)
{
	if (conf.shebang) {
		if (HAS_PROP(conf.shebang, lang))
			return [ conf.shebang[lang], lang ]
		else if (HAS_PROP(conf.shebang, suffix))
			return [ conf.shebang[suffix], suffix ]
	}

	return []
}

export function format_resolve_shebang(conf, lang, suffix)
{
	const [ shebang, key ] = resolve_shebang(conf, lang, suffix)

	if (!shebang || IS_STR(shebang) || IS_ARR(shebang))
		return shebang

	/*
	 * Remove this on the next iteration.
	 */
	if (Object.keys(conf.shebang[key]).length)
		vsc_warn('NAME.shebang uses string or array, old values are ignored')
	else
		vsc_warn(`malformatted shebang at NAME.shebang.${key}`)
}

function resolve_license(conf, lang, suffix)
{
	const fb = 'FB_LICENSE'

	/*
	 * Remove this on the next iteration.
	 */
	if (conf.spdx)
		warn_deprecated('NAME.spdx', 'NAME.license')

	if (!conf.license)
		return [ fb ]
	else if (HAS_PROP(conf.license, lang))
		return [ conf.license[lang], lang ]
	else if (HAS_PROP(conf.license, suffix))
		return [ conf.license[suffix], suffix ]
	else if (HAS_PROP(conf.license, '*'))
		return [ conf.license['*'], '*' ]

	return [ fb ]
}

export function format_resolve_license(conf, lang, suffix)
{
	let [ license, key ] = resolve_license(conf, lang, suffix)
	let replaces
	let chars

	if (IS_STR(license)) {
		replaces = license.split('{}').length
		chars = [ ...license ]
	}

	switch (replaces) {
	case 1:
		if (/\S/.test(chars[chars.length - 1]))
			chars.push(' ')

		chars.push('{}')
		license = chars.join('')
	case 2:
		return license
	}

	vsc_warn(`malformatted license at NAME.license.${key}`)
}

function resolve_copyright(conf, lang, suffix)
{
	const fb = [ 'FB_COPYRIGHT_BEGIN', 'FB_COPYRIGHT', 'FB_COPYRIGHT_END' ]

	if (!conf.copyright)
		return [ fb ]
	else if (HAS_PROP(conf.copyright, lang))
		return [ conf.copyright[lang], lang ]
	else if (HAS_PROP(conf.copyright, suffix))
		return [ conf.copyright[suffix], suffix ]
	else if (HAS_PROP(conf.copyright, '*'))
		return [ conf.copyright['*'], '*' ]

	return [ fb ]
}

export function format_resolve_copyright(conf, lang)
{
	const [ copyright, key ] = resolve_copyright(conf, lang)

	if (IS_ARR(copyright)) {
		const reduce_fn = (cnt, str) =>
			[ ...str.matchAll(REPLACE_STR_RE[[g]]) ].length + cnt
		const finds = copyright.reduce(reduce_fn, 0)

		if (finds == 1)
			return copyright
	}

	vsc_warn(`malformatted copyright notice at NAME.copyright.${key}`)
}

export function format_use_copyright(conf, lang, suffix)
{
	let key

	/*
	 * Remove this on the next iteration.
	 */
	if (conf.copyright_enabled)
		warn_deprecated('NAME.copyright_enabled', 'NAME.copyright_rule')

	if (!conf.copyright_rule)
		return 0
	else if (HAS_PROP(conf.copyright_rule, lang))
		key = lang
	else if (HAS_PROP(conf.copyright_rule, suffix))
		key = suffix
	else
		return 0

	return conf.copyright_rule[key] !== false &&
	       IS_ARR(conf.copyright_rule[key]) &&
	       !picomatch_test(suffix, conf.copyright_rule[key])
}
