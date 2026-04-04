# SPDX-License-Identifier: GPL-3.0-or-later

name := spdxheader

pnpm ?= pnpm
pnpm += install
pnpm-d := $(pnpm) -D

m4 ?= m4
m4 := printf '%s\n%s' 'changequote([[, ]])' 'undefine(shift)' | $(m4) -

esbuild ?= esbuild
esbuild += --bundle --format=esm
esbuild += --define:NULL=null --define:NAME='"$(name)"' --inject:define.js

terser ?= terser
terser += --module --ecma 2020 --mangle --comments false \
	  --compress 'passes=3,pure_getters=true,unsafe=true'

prefix := build
m4-prefix := $(prefix)/m4
license-prefix := license-list-data/json
module-prefix := node_modules

ifneq ($(minimize),)
	minimize := -terser
endif

ifneq ($(debug),)
	debug := -debug
endif

.PHONY: install uninstall publish
install:

package-in := $(wildcard package/*.json)
package-y  := package.json

$(package-y): %: %.in $(package-in) $(npm-module-y)
	$(m4) $< >$@

npm-packages := picomatch
npm-modules  := $(addprefix $(module-prefix)/,$(npm-packages))
npm-module-y := $(addsuffix /package.json,$(npm-modules))

$(npm-module-y): $(module-prefix)/%/package.json:
	$(pnpm-d) $*
	touch $(package-y).in

license-y := $(prefix)/licenses.json

$(license-y): $(prefix)/%: $(license-prefix)/%
	mkdir -p $(@D)
	jq -c '{ ids: [ .licenses[].licenseId ] }' $< >$@

spdxheader-m4-in := entry.js $(wildcard cmd/*.js) $(wildcard lib/*.js)
spdxheader-m4-y  := $(addprefix $(m4-prefix)/,$(spdxheader-m4-in))
spdxheader-y := $(prefix)/entry.js

$(m4-prefix)/%: %
	mkdir -p $(@D)
	$(m4) $< >$@

$(spdxheader-y)1: $(spdxheader-m4-y) $(license-y) $(npm-module-y)
	$(esbuild) --banner:js="import { createRequire } from 'node:module'; \
		   		var require = createRequire(import.meta.url);" \
		   --sourcemap --platform=node --external:vscode --outfile=$@ $<

terser-y := $(addsuffix 1-terser,$(spdxheader-y))
debug-y  := $(addsuffix -debug,$(spdxheader-y))

$(terser-y): %1-terser: %1
	$(terser) <$< >$@

$(spdxheader-y): %: %1$(minimize)
	head -n1 entry.js >$@
	printf '\n' >>$@
	cat $< >>$@

$(debug-y): %-debug: %1
	ln -f $< $@
	ln -f $< $*

archive-in := $(addsuffix $(debug),$(spdxheader-y)) README $(wildcard image/*)
archive-y  := $(prefix)/$(name).vsix

$(archive-y): $(archive-in) $(package-y)
	vsce package --skip-license -o $@

install: $(archive-y)
	code --install-extension $<

uninstall:
	code --uninstall-extension \
	     $$(code --list-extensions | grep $(name) || printf '39\n')

publish: $(archive-y)
	vsce publish --skip-license

.PHONY: clean distclean

clean:
	rm -f $(archive-y)
	rm -f $(spdxheader-m4-y) $(spdxheader-y)*
	rm -f $(license-y)

distclean: clean
	rm -f $(package-y)
	rm -f $(license-y)
	test -d $(module-prefix) && \
	find $(module-prefix) -mindepth 1 -maxdepth 1 -exec rm -rf {} +
