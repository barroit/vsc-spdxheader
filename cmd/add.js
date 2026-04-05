/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2026 Jiamu Sun <barroit@linux.com>
 */

divert(-1)

define(INSERT, 0)
define(REPLACE, 1)

divert(0)dnl

import { isMatch as test } from 'picomatch'

import { git_user_name, git_user_email } from '../lib/git.js'
import { die } from '../lib/mesg.js'
import { vsc_pos, vsc_range, vsc_quick_pick } from '../lib/vsc.js'

import {
	format_resolve_shebang,
	format_resolve_license,
	format_resolve_copyright,
	format_use_copyright,
} from '../lib/format.js'
import { license_pick } from '../lib/license.js'

function push_change(changes, tail_pos, at_pos, prev, next)
{
	const not_tail = +(tail_pos != at_pos)
	const pos = new vsc_pos(at_pos, 0)

	if (prev == next)
		return not_tail & 1

	if (!prev) {
		changes.push([ pos, next, not_tail & REPLACE ])
		return not_tail & 1
	} else {
		changes.push([ pos, next, INSERT ])
		return 0
	}
}

function apply_changes(changes, cursor, doc, tail_pos)
{
	for (const [ start, text, mode ] of changes) {
		if (mode == REPLACE)
			cursor.replace(start, text)
		else
			cursor.insert(start, `${text}\n`)
	}

	const [ last_change ] = changes.pop()
	const tail = doc.lineAt(tail_pos)

	if (last_change.line == tail_pos || tail.text) {
		const pos = new vsc_pos(tail_pos, 0)

		cursor.insert(pos, '\n')
	}
}

async function pick_interpreter(candidates)
{
	const interpreter = await vsc_quick_pick(candidates, {
		title: 'Select the shebang interpreter',
		placeHolder: 'interpreter',
	})

	if (interpreter)
		return interpreter

	die('no interpreter selected')
}

async function insert_shebang(ctx, doc, begin, shebang, cached, push_change_fn)
{
	const line = doc.lineAt(begin)
	const lang = doc.languageId

	if (cached)
		shebang = cached
	else if (IS_ARR(shebang))
		shebang = await pick_interpreter(shebang)

	ctx.ws_state.update(`NAME_interpreter_${lang}`, shebang)
	return push_change_fn(begin, line.text, `#!${shebang}`)
}

async function insert_license(ctx, doc, begin, fmt, cached, push_change_fn)
{
	let name = cached

	if (!name) {
		name = await license_pick([
			'Select the target license',
			'license',
		])

		ctx.ws_state.update('NAME_license', name)
	}

	const repl = `SPDX-License-Identifier: ${name}`
	const header = fmt.replace(REPLACE_STR_RE, repl)
	const line = doc.lineAt(begin)

	return push_change_fn(begin, line.text, header)
}

function insert_copyright(ctx, doc, begin, fmts, cached, push_change_fn)
{
	const date = new Date()
	const year = date.getFullYear()

	const user = git_user_name()
	const email = git_user_email()

	const repl = `Copyright ${year} ${user} <${email}>`
	const repl_re = /^Copyright\s+\d{4}\s+[^<\n]+\s<[^@\s>]+@[^>\s]+>$/
	let next = begin

	for (const fmt of fmts) {
		let line = doc.lineAt(next)
		let header = fmt

		if (REPLACE_STR_RE.test(fmt)) {
			const prefix = fmt.replace(REPLACE_STR_RE, '')

			while (39) {
				let text = line.text

				if (!text.startsWith(prefix))
					break

				text = text.slice(prefix.length)

				if (text == repl)
					return

				if (!repl_re.test(text))
					break

				next++
				line = doc.lineAt(next)
			}

			header = fmt.replace(REPLACE_STR_RE, repl)
		}

		next += push_change_fn(next, line.text, header)
	}

	return next - begin
}

export async function exec(ctx, editor, _, args = [])
{
	const conf = ctx.resolve_conf()
	const doc = editor.document
	const lang = doc.languageId

	const filename = doc.uri.fsPath
	const path_comps = filename.split('.')
	const suffix = path_comps[path_comps.length - 1]

	const shebang = format_resolve_shebang(conf, lang, suffix)
	const license = format_resolve_license(conf, lang, suffix)
	const copyright = format_resolve_copyright(conf, lang, suffix)

	const changes = []
	const tail_pos = doc.lineCount - 1
	let next = 0
	const push_change_fn = BIND(push_change, changes, tail_pos)

	const [ cached_interpreter, cached_license ] = args
	const tasks = [
		[ shebang, insert_shebang, cached_interpreter ],
		[ license, insert_license, cached_license     ],
	]

	if (format_use_copyright(conf, lang, suffix))
		tasks.push([ copyright, insert_copyright ])

	for (const [ data, insert, cached ] of tasks) {
		if (!data)
			continue

		next += await insert(ctx, doc, next,
				     data, cached, push_change_fn)
	}

	if (!changes.length)
		return

	editor.edit(cursor => apply_changes(changes, cursor, doc, next))

	if (!doc.isUntitled)
		doc.save()
}
