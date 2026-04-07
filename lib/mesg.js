/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import { str_capitalize } from './string.js'
import { vsc_info, vsc_error, vsc_warn } from './vsc.js'

export function die(mesg, detail)
{
	const ui_mesg = str_capitalize(mesg)
	let option

	if (detail)
		option = { detail, modal: true }

	vsc_error(ui_mesg, option)
	throw new Error(`fatal: ${mesg}`)
}
