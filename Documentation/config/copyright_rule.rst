.. SPDX-License-Identifier: GPL-3.0-or-later

===============
Copyright Rules
===============

Copyright rules define when a copyright notice is added.

The schema is defined as::

	{ str: [ str, ... ] }

The key specifies language ID or file extension.

The value accepts a list of globs_.

A notice applies to the current file only if:

1. language ID or file extension is defined in ``spdxheader.copyright_rule``
2. no glob in the corresponding list matches the filename

.. _globs: https://github.com/micromatch/picomatch?
           tab=readme-ov-file#globbing-features
