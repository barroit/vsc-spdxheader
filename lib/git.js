/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { join } from 'node:path'

import { die } from './mesg.js'
import exec from './exec.js'

export function git_ensure_exec()
{
	const [ _, __, exit ] = exec('git version')

	if (exit)
		die('git is missing in PATH')
}

export function git_inside_worktree()
{
	const [ _, __, exit ] = exec('git rev-parse --is-inside-work-tree')

	return exit == 0
}

export function git_repo_prefix()
{
	const [ prefix ] = exec('git rev-parse --show-toplevel')

	return prefix
}

export function git_ls_files()
{
	const cmd = 'git ls-files --cached --others --exclude-standard'
	const [ stdout ] = exec(cmd)

	const prefix = git_repo_prefix()
	const files = stdout.split('\n')

	return files.map(file => join(prefix, file))
}

export function git_user_name()
{
	const [ name ] = exec('git config get user.name')

	return name
}

export function git_user_email()
{
	const [ email ] = exec('git config get user.email')

	return email
}
