/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export function str_capitalize(str)
{
	const first = str.charAt(0)
	const rest = str.slice(1)
	const out = first.toUpperCase() + rest

	return out
}

export function str_escape(str)
{
	return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
}
