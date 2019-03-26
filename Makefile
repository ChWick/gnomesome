SHELL := /bin/bash

JS_FILES = *.js thirdparty

.PHONY: clean all

all: gnomesome.zip

extension: ./schemas/gschemas.compiled

./schemas/gschemas.compiled:
	glib-compile-schemas --strict ./schemas

gnomesome.zip: extension
	zip gnomesome.zip -r $(JS_FILES) metadata.json locale/*/*/*.mo schemas data icons

clean:
	rm -rf gnomesome.zip ./schemas/gschemas.compiled 

install:
	test -e ~/.local/share/gnome-shell/extensions/gnomesome@chwick.github.com || ln -s $(PWD) ~/.local/share/gnome-shell/extensions/gnomesome@chwick.github.com

remove:
	rm ~/.local/share/gnome-shell/extensions/gnomesome@chwick.github.com
