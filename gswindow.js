const Lang = imports.lang;
const Meta = imports.gi.Meta;

const GSWindow = new Lang.Class({
    Name: 'Gnomesome.Window',

    _init: function(window, gslayout) {
        this.window = window;
        this.floating = false;
        this.gslayout = gslayout;
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
        var type = this.window.get_window_type();
        var allowedWindowType = type == Meta.WindowType.NORMAL || type == Meta.WindowType.DESKTOP || type == Meta.WindowType.DIALOG;
        return !this.is_fullscreen() && ! this.floating && allowedWindowType;
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
});
