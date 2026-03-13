/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { extname } from 'node:path'

import escape from 'escape-string-regexp'

export function fmt_has_arg(fmt)
{
	return fmt.match(FMT_ARG_RE)
}

export function fmt_ensure_arg(fmt)
{
	if (!fmt_has_arg(fmt))
		fmt += ` ${FMT_ARG}`

	return fmt
}

export function fmt_emit_re_str(fmt_in, str, opt)
{
	const unsafe = fmt_in.split(FMT_ARG, 2)
	const safe = unsafe.map(escape)
	let fmt = safe.join(str)

	if (!opt)
		return fmt

	if (opt.begin)
		fmt = `^${fmt}`
	if (opt.end)
		fmt = `${fmt}$`

	return fmt
}

export function fmt_emit_re(fmt_in, str, opt)
{
	const fmt = fmt_emit_re_str(fmt_in, str, opt)

	if (opt && opt.flag)
		return new RegExp(fmt, opt.flag)
	else
		return new RegExp(fmt)
}

function keys_to_set(obj)
{
	const arr = Object.keys(obj)
	const set = new Set(arr)

	return set
}

export function fmt_resolve(map, doc, target_arr = [])
{
	const path = doc.uri.fsPath
	const lang = doc.languageId
	let ext = extname(path)

	if (ext)
		ext = ext.slice(1)

	const ret = {}
	let checks = [
		[ 'shebang', 'shebang',           [ ext, lang      ] ],
		[ 'spdx',    'spdx',              [ ext, lang, '*' ] ],
		[ 'copr',    'copyright',         [ ext, lang, '*' ] ],
		[ 'copr_y',  'copyright_enabled', [ ext, lang      ] ],
	]
	const target = new Set(target_arr)

	if (target.size)
		checks = checks.filter(([ name ]) => target.has(name))

	for (const [ name, key, search ] of checks) {
		const list = keys_to_set(map[key])
		const found = search.find(val => val && list.has(val))

		ret[name] = map[key][found]
		ret[`${name}_path`] = `${NAME}.${key}.${found}`
	}

	return ret
}

export function fmt_assert_single(found, path)
{
	switch (found) {
	case 1:
		break
	case 0:
		die(`found multiple placeholders in ${path}`)
	default:
		die(`found multiple placeholders in ${path}`)
	}
}
