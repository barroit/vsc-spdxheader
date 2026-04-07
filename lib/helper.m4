dnl SPDX-License-Identifier: GPL-3.0-or-later
dnl
divert(-1)

define(REPLACE_STR, {})
define(REPLACE_STR_RE, \{\})

define(COPYRIGHT_YEAR_RE, \d{4}(?:-\d{4})?(?:,\s*\d{4}(?:-\d{4})?)*)
define(COPYRIGHT_RE, Copyright\s+(COPYRIGHT_YEAR_RE)\s+.+\s+<[^>\s]+@[^>\s]+>)

define(BIND, $1.bind(undefined, [[shift($@)]]))

define(HAS_PROP, $1.hasOwnProperty($2))

define(IS_ARR, Array.isArray($1))
define(IS_STR, (typeof $1 == 'string' || $1 instanceof String))

define(RAW_STR, String.raw`$1`)

divert(0)dnl
