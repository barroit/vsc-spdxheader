.. SPDX-License-Identifier: GPL-3.0-or-later

================================
The vsc-spdxheader Documentation
================================

This page documents ``vsc-spdxheader``, a vscode extension for generating
shebang, license, and copyright notice headers.

Command
=======

.. glossary::

   spdxheader: add header

      Add optional shebang, SPDX license ID, and copyright notice headers to
      the file being edited. Reuse the cached license ID and shebang, if any.

   spdxheader: add header (select)

      Same as :term:`spdxheader: add header`, but bypass the cached license ID
      and shebang.

   spdxheader: update header

      Add the current year to the copyright years of the current Git user.

   spdxheader: move license id (workspace)

      Replace an old license with a new one.

Configuration
=============

.. toctree::
   :maxdepth: 2

   config/shebang
   config/license
   config/copyright
   config/copyright_rule
