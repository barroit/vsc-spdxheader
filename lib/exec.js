/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { spawnSync as node_spawn } from 'node:child_process'

import { vsc_ws_prefix } from './vsc.js'

export function execlp(file, ...args)
{
	args.pop()

	const prefix = vsc_ws_prefix()
	const arg0 = args.shift()

	const opt = {
		...this,
		argv0:    arg0,
		cwd:      prefix,
		encoding: 'utf8',
		shell:    true,
	}

	return node_spawn(file, args, opt)
}
