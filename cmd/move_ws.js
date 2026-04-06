/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { format_resolve_license } from '../lib/format.js'
import { git_ls_files } from '../lib/git.js'
import { license_format_header, license_pick } from '../lib/license.js'
import {
	vsc_apply_edit,
	vsc_open,
	vsc_save_all,
	vsc_ws_edit,
	vsc_uri,
} from '../lib/vsc.js'

function move(conf, doc, cursor, old_id, new_id)
{
	const lang = doc.languageId
	const filename = doc.uri.fsPath

	const path_comps = filename.split('.')
	const suffix = path_comps[path_comps.length - 1]

	const fmt = format_resolve_license(conf, lang, suffix)
	const old_header = license_format_header(fmt, old_id)
	const new_header = license_format_header(fmt, new_id)

	let line = doc.lineAt(0)
	let text = line.text

	if (text.startsWith('#!')) {
		line = doc.lineAt(1)
		text = line.text
	}

	if (text == old_header)
		cursor.replace(doc.uri, line.range, new_header)
}

export async function exec(ctx)
{
	const edit = new vsc_ws_edit()

	const old_id = await license_pick([
		'Select the license to replace',
		'from',
	])
	const new_id = await license_pick([
		'Select the new license',
		'to',
	])

	let filenames = git_ls_files()
	const files = filenames.map(vsc_uri.file)
	const conf = ctx.resolve_conf()
	let tasks = []

	for (const file of files) {
		const task = vsc_open(file).then(doc =>
		{
			move(conf, doc, edit, old_id, new_id)
			return doc
		}).catch(console.error)

		tasks.push(task)
	}

	tasks = await Promise.all(tasks)
	await vsc_apply_edit(edit)

	tasks = tasks.forEach(doc => doc && doc.save())
	return tasks
}
