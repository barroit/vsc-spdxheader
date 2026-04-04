/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	 vsc_add_cmd,
	 vsc_add_editor_cmd,
	 vsc_map_ctx,
	 vsc_resolve_config,
} from './lib/vsc.js'

const cmds = {
	'add':        [ import('./cmd/add.js'),        vsc_add_editor_cmd ],
	'add-cached': [ import('./cmd/add_cached.js'), vsc_add_editor_cmd ],
	'update':     [ import('./cmd/update.js'),     vsc_add_editor_cmd ],
	'move-ws':    [ import('./cmd/move_ws.js'),    vsc_add_cmd        ],
}

function fetch_format()
{
	return vsc_resolve_config('spdxheader')
}

export async function activate(ctx)
{
	for (const id of Object.keys(cmds)) {
		const [ module_promise, cb ] = cmds[id]

		const module = await module_promise
		const cmd_ctx = vsc_map_ctx(ctx)

		const exec = cb(`spdxheader.${id}`, module.exec, cmd_ctx)

		cmd_ctx.fetch_format = fetch_format
		ctx.subscriptions.push(exec)
	}
}
