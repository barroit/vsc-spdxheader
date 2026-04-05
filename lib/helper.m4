dnl SPDX-License-Identifier: GPL-3.0-or-later
dnl
divert(-1)

define(REPLACE_STR, {})
define(REPLACE_STR_RE, /\{\}/)

define(BIND, $1.bind(undefined, [[shift($@)]]))

define(HAS_PROP, $1.hasOwnProperty($2))

define(IS_ARR, Array.isArray($1))
define(IS_STR, (typeof $1 == 'string' || $1 instanceof String))

divert(0)dnl
