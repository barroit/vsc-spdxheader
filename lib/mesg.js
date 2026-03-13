/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { str_cap } from './string.js'
import { vsc_info, vsc_error, vsc_warn } from './vsc.js'

export function die(mesg, detail)
{
	const ui_mesg = str_cap(mesg)
	let option

	if (detail)
		option = { detail, modal: true }

	vsc_error(ui_mesg, option)
	throw new Error(`fatal: ${mesg}`)
}

export function error(mesg)
{
	mesg = str_cap(mesg)
	vsc_error(mesg)
}

export function warn(mesg)
{
	mesg = str_cap(mesg)
	vsc_warn(mesg)
}

export function info(mesg)
{
	mesg = str_cap(mesg)
	vsc_info(mesg)
}
