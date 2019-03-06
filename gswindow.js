const Lang = imports.lang;
const Meta = imports.gi.Meta;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const logging = Me.imports.logging;
const logger = logging.getLogger('Gnomesome.GSWindow');

const AllowedMetaTypes = [
      Meta.WindowType.NORMAL,
			Meta.WindowType.DIALOG,
			Meta.WindowType.TOOLBAR,
			Meta.WindowType.UTILITY,
			Meta.WindowType.SPLASHSCREEN,
];

const GSWindow = new Lang.Class({
    Name: 'Gnomesome.Window',

    _init: function(window, gslayout) {
        this.window = window;
        this.floating = false;
        this.gslayout = gslayout;
        this.geometry = this.rect();
    },
    reset: function() {
        this.floating = false;
        this.geometry = this.rect();
    },
    is_ready: function() {
        var rect = this.rect();
        logger.debug("Window size: h " + rect.height + " w " + rect.width + " x " +rect.x + " y " + rect.y);
        if (rect.width == 0 || rect.height == 0) {
            return false;
        }
        return true;
    },
    store_geometry: function() {
        this.geometry = this.rect();
    },
    restore_geometry: function() {
        this.set_maximize(false, false);
        this.window.move_resize_frame(
            true,
            this.geometry.x, this.geometry.y,
            this.geometry.width, this.geometry.height);
    },
    destroy: function() {
        this.gslayout.removeGSWindow(this);
    },
    get_workspace: function() {
        return this.window.get_workspace();
    },
    get_monitor: function() {
        return this.window.get_monitor();
    },
    layoutAllowed: function() {
        if ( this.window.get_role() == "quake" ) {
            return false;
        }
        if (!this.is_ready()) {return false;}
        var type = this.window.get_window_type();

        return !this.is_fullscreen() && ! this.floating && AllowedMetaTypes.indexOf(type) >= 0;
    },
    is_fullscreen: function() {
        return this.window.is_fullscreen();
    },
    is_maximized: function() {
        return this.window.get_maximized() > 0;
    },
    unmaximize_if_not_floating: function() {
        if (!this.floating) {
            this.set_maximize(false, false);
        }
    },
    set_maximize: function(maximize = true, change_floating = true) {
        if (maximize) {
            this.window.maximize(Meta.MaximizeFlags.BOTH);
        } else {
            this.window.unmaximize(Meta.MaximizeFlags.BOTH);
        }
        if (change_floating) {
            this.floating = this.is_maximized();
        }
    },

    rect: function() {
        var r = this.window.get_frame_rect();
        return r;
    },

    pos: function() {
        var r = this.window.get_frame_rect();
        return { x: r.x, y: r.y};
    },

    size: function() {
        var r = this.window.get_frame_rect();
        return { w: r.width, h: r.height};
    },
});
