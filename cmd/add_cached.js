/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import { vsc_exec_cmd } from '../lib/vsc.js'

export function exec(ctx, editor)
{
	const lang = editor.document.languageId
	const license = ctx.ws_state.get('NAME_license')
	const interpreter = ctx.ws_state.get(`NAME_interpreter_${lang}`)

	vsc_exec_cmd('NAME.add', [ interpreter, license ])
}
