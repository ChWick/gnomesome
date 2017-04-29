SHELL := /bin/bash

JS_FILES = {extension,manager,menubutton,convenience}.js

.PHONY: clean all

all: gnomesome.zip

extension: ./schemas/gschemas.compiled

./schemas/gschemas.compiled:
	glib-compile-schemas --strict ./schemas

gnomesome.zip: extension
	zip gnomesome.zip -r $(JS_FILES) metadata.json locale/*/*/*.mo schemas

clean:
	rm -rf gnomesome.zip ./schemas/gschemas.compiled 
