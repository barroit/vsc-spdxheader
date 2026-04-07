/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2026 Jiamu Sun <39@barroit.sh>
 */

export function path_suffix(filename)
{
	const components = filename.split('.')

	if (components[0] != filename)
		return components[components.length - 1]
}
