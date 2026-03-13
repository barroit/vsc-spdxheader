/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { join } from 'node:path'

import { die, warn } from './mesg.js'
import { execlp } from './exec.js'
import { str_split_line } from './string.js'

function assert_no_error(stderr)
{
	if (!stderr)
		return

	const giterr = str_split_line(stderr)

	die('failed to execute git', giterr[0])
}

function exec_git(...args)
{
	const { stdout, stderr } = execlp(...args)

	assert_no_error(stderr)
	return stdout
}

function git_config_fetch(section, key)
{
	const path = `${section}.${key}`
	let stdout = exec_git('git', 'git', 'config', '--get', path, NULL)

	if (!stdout) {
		warn(`no ${path} found with git-config(1)`)
		stdout = '????\n'
	}

	const lines = str_split_line(stdout)
	const out = lines[0]

	return out
}

export function git_user_name()
{
	return git_config_fetch('user', 'name')
}

export function git_user_email()
{
	return git_config_fetch('user', 'email')
}

export function git_show_toplevel()
{
	const stdout = exec_git('git', 'git',
				'rev-parse', '--show-toplevel', NULL)
	const lines = str_split_line(stdout)

	return lines[0]
}

export function git_ls_files()
{
	const stdout = exec_git('git', 'git', 'ls-files', '--cached',
				'--others', '--exclude-standard', NULL)
	const names = str_split_line(stdout)

	const toplevel = git_show_toplevel()
	const files = names.map(name => join(toplevel, name))

	return files
}
