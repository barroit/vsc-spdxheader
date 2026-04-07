.. SPDX-License-Identifier: GPL-3.0-or-later

=====================
Shebang configuration
=====================

This controls insertion behavior of shebang lines. It applies only when
executing ``spdxheader: add header`` and ``spdxheader: add header (select)``
commands.

The schema is defined as::

	{ str: str | [ str, ... ] }

The key specifies language ID or file extension.

The value accepts a single interpreter or list of interpreters.

If a list is provided, the extension displays a dropdown menu for interpreter
selection. The selection is cached for future use, bypassing the prompt on
subsequent calls. To override the cache and force selection, run
``spdxheader: add header (select)``.
