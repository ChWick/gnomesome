const Gio = imports.gi.Gio;
const Glib = imports.gi.GLib;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Ext = ExtensionUtils.getCurrentExtension();
const GnomesomeSettingsConvenience = Ext.imports.convenience;

const SCHEMA_ROOT = 'org.gnome.shell.extensions.gnomesome';
const KEYBINDINGS = SCHEMA_ROOT + '.keybindings';
const PREFS = SCHEMA_ROOT + '.prefs';

function envp_with_shellshape_xdg_data_dir() {
    var xdg_data_base = Ext.dir.get_child('data');
    if(!xdg_data_base.query_exists(null)) {
        return null;
    }
    xdg_data_base = xdg_data_base.get_path();

    var XDG_DATA_DIRS = 'XDG_DATA_DIRS';
    var old_xdg_data = Glib.getenv(XDG_DATA_DIRS);
    var new_xdg_data = null;
    if(old_xdg_data != null) {
        var entries = old_xdg_data.split(':');
        if(entries.indexOf(xdg_data_base) == -1) {
            new_xdg_data = old_xdg_data + ':' + xdg_data_base;
        }
    } else {
        var default_xdg = "/usr/local/share/:/usr/share/";
        new_xdg_data = default_xdg + ":" + xdg_data_base;
    }

    //TODO: so much effort to modify one key in the environment,
    // surely there is an easier way...
    var strings = [];
    strings.push(XDG_DATA_DIRS + '=' + new_xdg_data);
    var keys = Glib.listenv();
    for(var i in keys) {
        var key = keys[i];
        if(key == XDG_DATA_DIRS) continue;
        var val = Glib.getenv(key);
        strings.push(key + '=' + val);
    };
    return strings;
};

function get_local_gsettings(schema_path) {
    return GnomesomeSettingsConvenience.getSettings(schema_path);
};

function Keybindings() {
    var self = this;
    var settings = this.settings = get_local_gsettings(KEYBINDINGS);
    this.each = function(fn, ctx) {
        var keys = settings.list_children();
        for (var i=0; i < keys.length; i++) {
            var key = keys[i];
            var setting = {
                key: key,
                get: function() { return settings.get_string_array(key); },
                set: function(v) { settings.set_string_array(key, v); },
            };
            fn.call(ctx, setting);
        }
    };
};

function Prefs() {
    var self = this;
    var settings = this.settings = get_local_gsettings(PREFS);
    var get_boolean = function() { return settings.get_boolean(this.key); };
    var set_boolean = function(v) { settings.set_boolean(this.key, v); };
    var get_int = function() { return settings.get_int(this.key); };
    var set_int = function(v) { settings.set_int(this.key, v); };
    var get_string = function() { return settings.get_string(this.key); };
    var set_string = function(v) { settings.set_string(this.key, v); };

    this.SHOW_INDICATOR = {
        key: 'show-indicator',
        gsettings: settings,
        get: get_boolean,
        set: set_boolean,
    };
    this.DEFAULT_LAYOUT = {
        key: 'default-layout',
        gsettings: settings,
        get: get_string,
        set: set_string,
    };
};

function initTranslations(domain) {
    GnomesomeSettingsConvenience.initTranslations(domain);
}

