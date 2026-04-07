.. SPDX-License-Identifier: GPL-3.0-or-later

=======================
Copyright Configuration
=======================

This controls formatting of copyright notices.

The schema is defined as::

	{ str: [ str, ... ] }

The key specifies language ID or file extension.

The value accepts a list of format strings.

Across the entire list, at most one ``{}`` substitution placeholder is
permitted, which is replaced with ``Copyright year name <email>``.
