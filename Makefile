# SPDX-License-Identifier: GPL-3.0-or-later

name := $(shell head -1 README)

pnpm ?= pnpm
pnpm += add -D

m4 ?= m4
m4 := printf '%s' 'changequote([[, ]])' | $(m4) -

esbuild ?= esbuild
esbuild += --bundle --format=esm --platform=node --define:NAME='"$(name)"'

terser ?= terser
terser += --module --ecma 2020 --mangle --comments false \
	  --compress 'passes=3,pure_getters=true,unsafe=true'

objtree := build
m4dir := $(objtree)/m4

ifneq ($(MINIMIZE),)
	MINIMIZE := -min
endif

.PHONY: install uninstall publish
install:

meta-src := $(wildcard meta/*.json)
meta-y := package.json

package_list := picomatch
package-o := $(addprefix node_modules/,$(package_list))
package-y := $(addsuffix /package.json,$(package-o))

node_modules/%/package.json:
	$(pnpm) $*
	touch package.json.in

$(meta-y): package.json.in $(meta-src) $(package-y)
	$(m4) $< >$@

license_ids-y := $(objtree)/license_ids.json

$(license_ids-y): license-list-data/json/licenses.json
	mkdir -p $(@D)
	jq -c '[ .licenses[].licenseId ]' <$< >$@

spdxheader-src := entry.js $(wildcard cmd/*.js) $(wildcard lib/*.js)
spdxheader-m4  := $(addprefix $(m4dir)/,$(spdxheader-src))
spdxheader-y   := $(objtree)/entry.js

$(m4dir)/%: lib/helper.m4 %
	mkdir -p $(@D)
	$(m4) $^ >$@

$(spdxheader-y)1: $(spdxheader-m4) $(license_ids-y) $(package-y)
	$(esbuild) --banner:js="import { createRequire } from 'node:module'; \
				var require = createRequire(import.meta.url);" \
		   --sourcemap=inline --external:vscode --outfile=$@ $<

$(spdxheader-y)1-min: %-min: %
	$(terser) >$@ <$<

$(spdxheader-y): %: %1$(MINIMIZE)
	cp $< $@

README.md: NOTREADME.md
	$(m4) $< >$@

archive-src := $(spdxheader-y) README.md $(wildcard image/*)
archive-y  := $(objtree)/$(name).vsix

$(archive-y): $(archive-src) $(meta-y)
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
	rm -f $(archive-y) README.md
	rm -f $(spdxheader-m4) $(spdxheader-y)*
	rm -f $(license_ids-y)

distclean: clean
	rm -f $(meta-y)
	find node_modules -type f -exec rm -f {} + 2>/dev/null || true
