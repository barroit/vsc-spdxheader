/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

import { git_ensure_exec } from './lib/git.js'
import {
	vsc_resolve_config,
	vsc_map_ctx,
	vsc_add_cmd,
	vsc_add_editor_cmd,
	vsc_exec_cmd,
} from './lib/vsc.js'

const cmds = [
	[ 'add',        import('./cmd/add.js'),        vsc_add_editor_cmd ],
	[ 'add-cached', import('./cmd/add_cached.js'), vsc_add_editor_cmd ],
	[ 'update',     import('./cmd/update.js'),     vsc_add_editor_cmd ],
	[ 'move-ws',    import('./cmd/move_ws.js'),    vsc_add_cmd        ],
]

function resolve_conf()
{
	return vsc_resolve_config('NAME')
}

async function register_cmd(ctx, [ name, __module, add_cmd ])
{
	const module = await __module
	const cmd_ctx = { ...ctx }

	const exec_fn = BIND(module.exec, cmd_ctx)
	const hook = add_cmd(`NAME.${name}`, exec_fn)

	ctx.cleanup.push(hook)
}

export async function activate(__ctx)
{
	await git_ensure_exec()

	const ctx = vsc_map_ctx(__ctx)
	const register_cmd_fn = BIND(register_cmd, ctx)

	ctx.resolve_conf = resolve_conf
	cmds.forEach(register_cmd_fn)
}
