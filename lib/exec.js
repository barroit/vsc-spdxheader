/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { spawnSync } from 'node:child_process'

import { vsc_ws_prefix } from './vsc.js'

export default function exec(cmd, cwd)
{
	const opt = {
		cwd,
		windowsHide: true,
		encoding: 'utf8',
		shell: true,
	}

	let stdout
	let stderr 
	let exit
	let result

	if (!opt.cwd)
		opt.cwd = vsc_ws_prefix()

	result = spawnSync(cmd, opt)

	if (result.error)
		return [ '', result.error.message, 127 ]

	stdout = result.stdout.trimEnd()
	stderr = result.stderr.trimEnd()
	exit = result.status ?? 128

	return [ stdout, stderr, exit ]
}
