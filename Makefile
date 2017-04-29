SHELL := /bin/bash

JS_FILES = {extension,manager,menubutton,convenience}.js

.PHONY: clean all

all: gnomesome.zip

schemas:
	mkdir ./schemas/
	glib-compile-schemas --strict --targetdir=./schemas/ .

gnomesome.zip: schemas
	zip gnomesome.zip -r $(JS_FILES) metadata.json locale/*/*/*.mo schemas

clean:
rm -rf gnomesome.zip schemas
