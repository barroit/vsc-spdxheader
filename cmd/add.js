/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { isMatch as test } from 'picomatch'

import { git_user_name, git_user_email } from '../lib/git.js'
import { info, die } from '../lib/mesg.js'
import { today } from '../lib/time.js'
import { vsc_pos, vsc_range, vsc_quick_pick } from '../lib/vsc.js'

import {
	fmt_has_arg,
	fmt_ensure_arg,
	fmt_resolve,
	fmt_assert_single,
} from '../lib/fmt.js'
import {
	spdx_pick_license,
	spdx_fixup_id,
	spdx_emit_header,
} from '../lib/spdx.js'

const INSERT  = 0
const REPLACE = 1

function is_copr_enabled(path, ignores)
{
	return ignores && !test(path, ignores)
}

function push_change(doc, from, to, at, queue)
{
	const last = doc.lineCount - 1
	const mask = last != at

	if (from == to)
		return 1 & mask

	const pos = new vsc_pos(at, 0)

	if (!from) {
		queue.push([ pos, to, REPLACE & mask ])
		return 1 & mask

	} else {
		queue.push([ pos, to, INSERT ])
		return 0
	}
}

async function require_shebang_binary(map, path)
{
	const keys = Object.keys(map)

	if (!keys)
		die(`malformatted shebang config at ${path}`)

	const items = Object.values(map)
	const binary = vsc_quick_pick(items, {
		title: 'Select the binary filled in shebang',
		placeHolder: 'binary',
	})

	if (!binary)
		die('no binary selected')

	return binary
}

async function insert_shebang(editor, shebang, shebang_path, changes, next)
{
	const doc = editor.document
	const line = doc.lineAt(next)

	if (typeof shebang != 'string')
		shebang = await require_shebang_binary(shebang, shebang_path)

	const header = `#!${shebang}`

	return push_change(doc, line.text, header, next, changes)
}

async function insert_spdx(editor, fmt, fmt_path, changes, next, args)
{
	const doc = editor.document
	const state = this.ws_state

	let id = args && args[0]

	if (!id) {
		id = await spdx_pick_license({
			prompt: 'Select the target license',
			hint: 'target license',
		})
	}
	state.update('license', id)

	const new_fmt = fmt_ensure_arg(fmt)
	const new_id = spdx_fixup_id(id)

	const header = spdx_emit_header(new_fmt, new_id)
	const line = doc.lineAt(next)

	return push_change(doc, line.text, header, next, changes)
}

async function insert_copr(editor, fmts, fmts_path, changes, next_in)
{
	const doc = editor.document
	const { year } = today()

	const user = git_user_name()
	const email = git_user_email()
	const repl = `Copyright ${year} ${user} <${email}>`

	let found = 0
	let next = next_in

	for (const fmt of fmts) {
		const line = doc.lineAt(next)
		let header = fmt

		if (fmt_has_arg(fmt)) {
			found++
			header = fmt.replace(FMT_ARG_RE, repl)
		}

		next += push_change(doc, line.text, header, next, changes)
	}

	fmt_assert_single(found, fmts_path)
	return next - next_in
}

function apply_changes(doc, cursor, changes, last)
{
	for (const [ start, text, mode ] of changes) {
		if (mode == REPLACE)
			cursor.replace(start, text)
		else
			cursor.insert(start, `${text}\n`)
	}

	const [ last_change ] = changes.pop()
	const last_line = doc.lineAt(last)

	if (last_change.line == last || last_line.text) {
		const pos = new vsc_pos(last, 0)

		cursor.insert(pos, '\n')
	}
}

export async function exec(editor, _, args)
{
	const format = this.fetch_format()
	const doc = editor.document
	const path = doc.uri.fsPath

	const fmts = fmt_resolve(format, doc)
	const use_copr = is_copr_enabled(path, fmts.copr_y)

	if (!use_copr)
		fmts.copr = undefined

	const tasks = [
		[ fmts.shebang, insert_shebang, fmts.shebang_path ],
		[ fmts.spdx   , insert_spdx,    fmts.spdx_path    ],
		[ fmts.copr   , insert_copr,    fmts.copr_path    ],
	]
	const changes = []
	let next = 0

	for (const [ data, func, data_path ] of tasks) {
		if (!data)
			continue

		next += await func.call(this, editor,
					data, data_path, changes, next, args)
	}

	if (!changes.length)
		return

	editor.edit(cursor => apply_changes(doc, cursor, changes, next))

	if (!doc.isUntitled)
		doc.save()
}
