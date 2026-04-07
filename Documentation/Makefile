# SPDX-License-Identifier: GPL-3.0-or-later

sphinx-build ?= sphinx-build
sphinx-autobuild ?= sphinx-autobuild

sphinx-build += --conf-dir sphinx
sphinx-autobuild += --conf-dir sphinx

prefix := build

builds := html man info help

.PHONY: live $(builds)

live:
	$(sphinx-autobuild) --builder html . $(prefix)/html

$(builds):
	$(sphinx-build) --builder $@ . $(prefix)/$@
