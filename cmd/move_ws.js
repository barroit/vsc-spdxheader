/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { extname } from 'node:path'

import { fmt_ensure_arg, fmt_resolve } from '../lib/fmt.js'
import { git_ls_files } from '../lib/git.js'
import {
	vsc_apply,
	vsc_open,
	vsc_save_all,
	vsc_ws_edit,
	vsc_uri,
} from '../lib/vsc.js'

import {
	spdx_fixup_id,
	spdx_emit_header,
	spdx_pick_license,
} from '../lib/spdx.js'

function move(doc, cursor, from, to)
{
	const format = this.fetch_format()
	const { spdx: fmt_in } = fmt_resolve(format, doc, [ 'spdx' ])
	const fmt = fmt_ensure_arg(fmt_in)

	const origin = spdx_emit_header(fmt, from)
	const replace = spdx_emit_header(fmt, to)

	let line = doc.lineAt(0)
	let text = line.text

	if (text.startsWith('#!')) {
		line = doc.lineAt(1)
		text = line.text
	}

	if (text == origin)
		cursor.replace(doc.uri, line.range, replace)
}

export async function exec()
{
	const edit = new vsc_ws_edit()

	const from_id = await spdx_pick_license({
		prompt: 'Select the license to replace',
		hint: 'from',
	})
	const to_id = await spdx_pick_license({
		prompt: 'Select the license to replace with',
		hint: 'to',
	})

	const from = spdx_fixup_id(from_id)
	const to = spdx_fixup_id(to_id)

	let files = git_ls_files()
	let tasks = []

	files = files.map(vsc_uri.file)

	for (const file of files) {
		const task = vsc_open(file).then(doc =>
		{
			move.call(this, doc, edit, from, to)
			return doc

		}).catch(console.error)

		tasks.push(task)
	}

	tasks = await Promise.all(tasks)
	await vsc_apply_edit(edit)

	tasks = tasks.map(doc => doc && doc.save())
	return tasks
}
