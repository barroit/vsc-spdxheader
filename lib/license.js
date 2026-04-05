/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import { existsSync as exists, readdirSync as readdir } from 'node:fs'
import { join } from 'node:path'

import { git_repo_prefix } from '../lib/git.js'
import { die } from '../lib/mesg.js'
import { vsc_quick_pick } from '../lib/vsc.js'

const __license_ids = await import('../../license_ids.json')
const license_ids = new Set(__license_ids)

function scan_licenses()
{
	const prefix = git_repo_prefix()
	const dir = join(prefix, 'LICENSES')

	if (exists(dir))
		return readdir(dir)

	return []
}

function id_to_name(id)
{
	return license_ids.has(id) ? id : `LicenseRef-${id}`
}

export async function license_pick([ prompt, hint ])
{
	const licenses = scan_licenses()

	if (!licenses.length)
		die('no file found in LICENSES/')

	const names = licenses.map(id_to_name)
	const name = await vsc_quick_pick(names, {
		title: prompt,
		placeHolder: hint,
	})

	if (name)
		return name

	die('no license selected')
}

