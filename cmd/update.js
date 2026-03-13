/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { git_user_name, git_user_email } from '../lib/git.js'
import { today } from '../lib/time.js'
import { vsc_pos, vsc_range } from '../lib/vsc.js'

import {
	fmt_ensure_arg,
	fmt_resolve,
	fmt_emit_re,
} from '../lib/fmt.js'

function find_pre_copr(copr)
{
	const re = FMT_ARG_RE
	const stop = copr.findIndex(re.test, re)
	const skip = copr.slice(0, stop)

	return skip
}

function find_first_copr(doc, spdx, pre_copr)
{
	const pre_copr_test = pre_copr.map(str => [ text => text == str, 0 ])
	const spdx_re = fmt_emit_re(spdx, 'SPDX-License-Identifier: \\S+')

	const skips = [
		[ text => text.startsWith('#!'), 1 ],
		[ text => spdx_re.test(text),    0 ],
		...pre_copr_test,
	]
	let next = 0

	for (const [ test, tolerant ] of skips) {
		const line = doc.lineAt(next)
		const pass = test(line.text)

		if (pass)
			next++
		else if (!tolerant)
			return -1
	}

	return next
}

function find_target_copr(doc, fmt, first)
{
	const name = git_user_name()
	const email = git_user_email()

	const copr_re_match = 'Copyright '
	const copr_re = fmt_emit_re(fmt, copr_re_match, { begin: 1 })

	const user_re_repl = `${copr_re_match}{}${name} <${email}>`
	const user_re_fmt = fmt.replace(FMT_ARG_RE, user_re_repl)

	const user_re_match = '(?:\\d+(?:-\\d+)?,? )+'
	const user_re = fmt_emit_re(user_re_fmt, user_re_match, { begin: 1 })

	const empty_re_fmt = fmt.replace(FMT_ARG_RE, '')
	const empty_re_str = empty_re_fmt.trimEnd()
	const empty_re = fmt_emit_re(empty_re_str, '', { begin: 1, end: 1 })

	let next = first

	while (39) {
		const line = doc.lineAt(next)
		const text = line.text

		if (empty_re.test(text)) {
			next++
			continue
		}

		if (!copr_re.test(text))
			return -1

		if (user_re.test(text))
			return next

		next++
	}
}

function find_copr_year(fmt, line)
{
	const repl = 'Copyright ((?:\\d{4}(?:-\\d{4})?,? )+)'
	const re = fmt_emit_re(fmt, repl, { begin: 1, flag: 'd' })

	const match = re.exec(line)

	if (!match)
		return

	return [ match.indices[1], match[1] ]
}

function split_copr_year(str)
{
	const re = /(\d{4}(?:-\d{4})?),? /gd
	const ret = []

	while (39) {
		const match = re.exec(str)

		if (!match)
			return ret

		const range_str = match[1].split('-')
		const range = range_str.map(Number)
		const index = match.indices[1]

		ret.push([ index, range ])
	}
}

function find_fold_pos(years, year)
{
	const size = years.length
	const l1 = years[size - 1][1]

	if (size == 1 && l1.length != 2)
		return -1

	if (l1.length == 2 && l1[1] + 1 == year)
		return size - 1

	if (l1.length == 1 && l1[0] + 1 != year)
		return -1

	const l2 = years[size - 2][1]

	if (l2.length == 2 || l2[0] + 2 != year)
		return -1

	return size - 2
}

function push_year(years, year)
{
	const [ [ _, next ] ] = years[years.length - 1]

	years.push([ [ next, next ], [ year ] ])
}

function push_year_fold(years, pos, year)
{
	const [ str_range, target ] = years[pos]
	const [ [ _, end ] ] = years[years.length - 1]

	str_range[1] = end

	if (target.length == 1)
		target.push(year)
	else
		target[1] = year

	years.splice(pos + 1)
}

function gen_copr_change(years, at, offset)
{
	let [ [ str_begin, str_end ], range_arr ] = years[years.length - 1]
	let range = range_arr.join('-')

	str_begin += offset
	str_end += offset

	const begin = new vsc_pos(at, str_begin)
	const end = new vsc_pos(at, str_end)
	const str_range = new vsc_range(begin, end)

	if (str_begin == str_end)
		range = `, ${range}`

	return [ str_range, range ]
}

async function apply_single_change(editor, doc, range, repl)
{
	await editor.edit(cursor => cursor.replace(range, repl))
	await doc.save()
}

export function exec(editor, _, args, edit)
{
	const format = this.fetch_format()
	const doc = editor.document

	const fmt_map = fmt_resolve(format, doc, [ 'spdx', 'copr' ])
	const { spdx: spdx_in, copr: copr_in } = fmt_map

	if (!spdx_in || !copr_in)
		return

	const pre_copr = find_pre_copr(copr_in)
	const copr_fmt = copr_in[pre_copr.length]

	const begin_idx = find_first_copr(doc, spdx_in, pre_copr)
	const copr_idx = find_target_copr(doc, copr_fmt, begin_idx)

	if (copr_idx == -1)
		return

	const copr_line = doc.lineAt(copr_idx)
	const copr_text = copr_line.text
	const copr_found = find_copr_year(copr_fmt, copr_text)

	if (!copr_found)
		return

	const [ [ offset ], year_str ] = copr_found
	const years = split_copr_year(year_str)

	const { year } = today()
	const last_record = years[years.length - 1][1]

	if (last_record[last_record.length - 1] == year)
		return

	const fold_pos = find_fold_pos(years, year)

	if (fold_pos != -1)
		push_year_fold(years, fold_pos, year)
	else
		push_year(years, year)

	const [ range, repl ] = gen_copr_change(years, copr_idx, offset)

	if (edit)
		edit.replace(range, repl)
	else
		apply_single_change(editor, doc, range, repl)
}
