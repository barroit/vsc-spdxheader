.. SPDX-License-Identifier: GPL-3.0-or-later

=====================
License configuration
=====================

This controls formatting of license headers.

The schema is defined as::

	{ str: str }

The key specifies language ID or file extension.

The value accepts a format string.

The format string permits at most one ``{}`` substitution placeholder,
which is replaced with ``SPDX-License-Identifier: id``.

If no placeholder is present, the identifier is appended to the tail, prefixed
with a space if necessary.
