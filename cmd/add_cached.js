/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { vsc_exec_cmd } from '../lib/vsc.js'

export function exec()
{
	const state = this.ws_state

	const license = state.get('license')
	const args = [ license ]

	vsc_exec_cmd('spdxheader.add', args)
}
