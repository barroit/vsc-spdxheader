/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import {
	format_resolve_license,
	format_resolve_copyright,
	format_to_regex,
} from '../lib/format.js'
import { git_user_name, git_user_email } from '../lib/git.js'
import { path_suffix } from '../lib/path.js'
import { str_escape } from '../lib/string.js'
import { vsc_pos, vsc_range } from '../lib/vsc.js'

function is_shebang(doc, nl)
{
	const line = doc.lineAt(nl)

	return /#!\S+/.test(line.text)
}

function is_license(doc, nl, fmt)
{
	const line = doc.lineAt(nl)
	const re = format_to_regex(fmt, 'SPDX-License-Identifier:\\s+\\S+')

	return +re.test(line.text)
}

function find_first_copyright(doc, nl, fmts)
{
	for (const fmt of fmts) {
		const line = doc.lineAt(nl)

		if (/REPLACE_STR_RE/.test(fmt))
			return nl
		else if (line.text == fmt)
			nl++
		else
			return -1
	}
}

function find_target_copyright(doc, nl, line_fmt)
{
	const name = git_user_name()
	const email = git_user_email()

	const name_clean = str_escape(name)
	const email_clean = str_escape(email)

	const copyright_re_str = RAW_STR(^Copyright\s+) +
				 RAW_STR(COPYRIGHT_YEAR_RE\s+) +
				 `${name_clean}\\s+` +
				 `<${email_clean}>$`

	const copyright_re = new RegExp(copyright_re_str)
	const line_re = format_to_regex(line_fmt, RAW_STR((COPYRIGHT_RE)))

	while (39) {
		const line = doc.lineAt(nl)
		const match = line.text.match(line_re)

		if (!match)
			return -1

		if (copyright_re.test(match[1]))
			return nl

		nl++
	}
}

function fold_years(years)
{
	const l1 = years[years.length - 1]
	const l2 = years[years.length - 2]
	const l3 = years[years.length - 3]

	if (l2) {
		if (l2.length == 2) {
			if (l1[0] - 1 == l2[1]) {
				l2[1] = l1[0]
				years.pop()
			}
		} else if (l3) {
			if (l2[0] - 1 == l3[0]) {
				l3.push(l1[0])
				years.pop()
				years.pop()
			}
		}
	}
}

export async function exec(ctx, editor, _, args, edit)
{
	const conf = ctx.resolve_conf()
	const doc = editor.document

	const lang = doc.languageId
	const suffix = path_suffix(doc.uri.fsPath)

	const license_fmt = format_resolve_license(conf, lang, suffix)
	const copyright_fmts = format_resolve_copyright(conf, lang, suffix)
	const line_fmt = copyright_fmts.find(fmt => /REPLACE_STR_RE/.test(fmt))

	let nl = 0

	if (is_shebang(doc, nl))
		nl++

	if (is_license(doc, nl, license_fmt))
		nl++

	nl = find_first_copyright(doc, nl, copyright_fmts)
	if (nl == -1)
		return

	nl = find_target_copyright(doc, nl, line_fmt)
	if (nl == -1)
		return

	const line = doc.lineAt(nl)
	let [ years_str ] = line.text.match(/COPYRIGHT_YEAR_RE/)
	const years = years_str.split(',')
			       .map(str => str.trim())
			       .map(str => str.split('-'))
			       .map(arr => arr.map(Number))

	const date = new Date()
	const year = date.getFullYear()
	const last_year = years[years.length - 1]

	if (last_year[last_year.length - 1] == year)
		return

	years.push([ year ])
	fold_years(years)

	const begin = line.text.indexOf(years_str)
	const end = begin + years_str.length

	const begin_pos = new vsc_pos(nl, begin)
	const end_pos = new vsc_pos(nl, end)
	const repl_range = new vsc_range(begin_pos, end_pos)

	years_str = years.map(arr => arr.join('-')).join(', ')

	return editor.edit(cursor => cursor.replace(repl_range, years_str))
		     .then(() => doc.save())
}
