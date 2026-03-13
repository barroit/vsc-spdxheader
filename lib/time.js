/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export function today()
{
	const date = new Date()
	const year = date.getFullYear()
	const month = date.getMonth()
	const day = date.getDate()

	return { year, month, day }
}
