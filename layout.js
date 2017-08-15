const Lang = imports.lang;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SplitLayout = Me.imports.splitlayout;
const FloatLayout = Me.imports.floatlayout;
const MaximizeLayout = Me.imports.maximizelayout;
const Utils = Me.imports.utils;

var Modes = {
    FLOATING: 0,
    VBOXLAYOUT: 1,
    HBOXLAYOUT: 2,
    MAXIMIZED: 3,
    properties: {
        0: {
            value: 0, name: "floating",
            enterLayout: FloatLayout.enterFloatingLayout,
            exitLayout: FloatLayout.exitFloatingLayout,
            layout: FloatLayout.updateFloatingLayout,
            icon: "window-tile-floating-symbolic",
        },
        1: {
            value: 1, name: "horizontal",
            enterLayout: SplitLayout.enterVBoxLayout,
            exitLayout: SplitLayout.exitVBoxLayout,
            layout: SplitLayout.applyVBoxLayout,
            icon: "window-tile-vertical-symbolic",
        },
        2: {
            value: 2, name: "vertical",
            enterLayout: SplitLayout.enterHBoxLayout,
            exitLayout: SplitLayout.exitHBoxLayout,
            layout: SplitLayout.applyHBoxLayout,
            icon: "window-tile-horizontal-symbolic",
        },
        3: {
            value: 3, name: "maximized",
            enterLayout: MaximizeLayout.enterMaximizeLayout,
            exitLayout: MaximizeLayout.exitMaximizeLayout,
            layout: MaximizeLayout.updateMaximizeLayout,
            icon: "window-tile-full-symbolic",
        },
    },
    byName: function(name) {
        for (var key in Modes.properties) {
            if (Modes.properties.hasOwnProperty(key)) {
                if (name == Modes.properties[key].name) {
                    return key;
                }
            }
        }
        global.log("[gnomesome] Error layout with label " + name + " not found");
        return -1;
    },
};

const NumModes = Object.keys(Modes.properties).length;

const Layout = new GObject.Class({
    Name: 'Gnomesome.Layout',
    GTypeName: 'GnomesomeLayout',
    Properties: {
        'mode': GObject.ParamSpec.int('mode', 'ModeProperty', 'Mode property', GObject.ParamFlags.READWRITE, 0, NumModes - 1, Modes.FLOATING),
        'split-pos': GObject.ParamSpec.float('split-pos', "Split position", "Position of the split", GObject.ParamFlags.READWRITE, 0.2, 0.8, 0.5),
        'n-master': GObject.ParamSpec.int('n-master', "Number of master", "Number of master windows", GObject.ParamFlags.READWRITE, 0, 5, 1),
    },
    Signals: {
    },

    _init: function(prefs) {
        this.parent();
        this.gswindows = [];
        this._mode = Modes.FLOATING;
        this._split_pos = 0.5;
        this._n_master = 1;

        // this.connect('notify::mode', Lang.bind(this, function () {this.relayout();}));  // handled in layout_changed(from, to)
        this.connect('notify::split-pos', Lang.bind(this, function () {this.relayout();}));
        this.connect('notify::n-master', Lang.bind(this, function () {this.relayout();}));

        // monitor prefs
        let update = Lang.bind(this, function() {
            let name = prefs.DEFAULT_LAYOUT.get();
            global.log("[gnomesome] Updating default layout to " + name);
            let new_layout = Modes.byName(name);
            if (this._initial) {
                this.mode = new_layout;
                // keep this as initial!
                this._initial = true;
            }
        });
        Utils.connect_and_track(this, prefs.DEFAULT_LAYOUT.gsettings, "changed::" + prefs.DEFAULT_LAYOUT.key, update);

        // setup to initial layout
        this._initial = true;
        update();
    },
    destroy: function() {
        Utils.disconnect_tracked_signals(this);
        global.log("[gnomesome] Cleaning up layout.");
        for (var gsw in this.gswindows) {
            gsw.gswindow = null;
        }
        this.gswindows = [];
    },
    get mode() {return this._mode;},
    set mode(mode) { if (this._mode != mode) { this.layout_changed(this._mode, mode); this._mode = mode; this.notify("mode"); } this._initial = false;},
    //set mode(mode) { if (this._mode != mode) { this._mode = mode; this.notify("mode"); } },

    get split_pos() {return this._split_pos;},
    set split_pos(pos) {pos = Math.max(Math.min(pos, 0.8), 0.2); if (this._split_pos != pos) {this._split_pos = pos; this.notify("split-pos");}},
    resize_master_area: function(scale) {this.split_pos += scale;},

    get n_master() {return this._n_master;},
    set n_master(n) {n = Math.max(Math.min(n, 5), 0); if (this._n_master != n) {this._n_master = n; this.notify("n-master"); } },
    increment_n_master: function(n) {this.n_master += n;},

    set_master: function(window) {
        const gswindow = this.getGSWindowFromWindow(window);
        if (!gswindow) {return;}
        // remove window but dont relayout
        this.removeGSWindow(gswindow, false);
        // add window at front
        this.gswindows.unshift(gswindow);
        // set n_master to 1 and force relayout if there is no change
        if (this.n_master != 1) {this.n_master = 1;}
        else {this.relayout();}
    },

    layout_name: function() {
        return Modes.properties[this.mode].name;
    },
    layout: function() {
        return Modes.properties[this.mode].layout;
    },
    properties: function() {
        return Modes.properties[this.mode];
    },
    relayout: function() {
        global.log("[gnomesome] Current layout " + this.layout_name());
        var gswindows = this.allLayoutGSWindows();
        this.layout()(gswindows, this.split_pos, this.n_master);
    },
    layout_changed: function(old_mode, new_mode) {
        global.log("[gnomesome] Layout changed from " + Modes.properties[old_mode].name
             + " to " + Modes.properties[new_mode].name);
        var gs_wnds = this.allLayoutGSWindows();
        Modes.properties[old_mode].exitLayout(gs_wnds, this.split_pos, this.n_master);
        Modes.properties[new_mode].enterLayout(gs_wnds, this.split_pos, this.n_master);
        Modes.properties[new_mode].layout(gs_wnds, this.split_pos, this.n_master);
    },
    num_layouts: function() {
        return NumModes;
    },
    roll_layout: function(offset) {
        var next_layout_id = (this.mode + offset + this.num_layouts()) % this.num_layouts();
        global.log("[gnomesome] Rolling layout " + Modes.properties[next_layout_id].name);
        this.mode = next_layout_id;
    },
    addGSWindow: function(gswindow, relayout=true) {
        if (!gswindow) {return;}
        gswindow.gslayout = this;
        var index = this.gswindows.indexOf(gswindow);
        if (index < 0) {
            // only if not in list
            this.gswindows.push(gswindow);
            if (relayout) {
                this.relayout();
            }
        }
    },
    removeGSWindow: function(gswindow, relayout=true) {
        if (!gswindow) {return;}
        gswindow.gslayout = null;
        var index = this.gswindows.indexOf(gswindow);
        if (index >= 0) {
            // only if in list
            this.gswindows.splice(index, 1);
            if (relayout) {
                this.relayout();
            }
        }
    },
    allWindows: function() {
        var windows = [];
        for (var idx = 0; idx < this.gswindows.length; ++idx) {
            windows.push(this.gswindows[idx].window);
        }
        return windows;
    },
    allLayoutGSWindows: function() {
        var gswindows = [];
        for (var idx = 0; idx < this.gswindows.length; ++idx) {
            if (this.gswindows[idx].layoutAllowed()) {
                gswindows.push(this.gswindows[idx]);
            }
        }
        return gswindows;
    },
    allLayoutWindows: function() {
        var windows = [];
        for (var idx = 0; idx < this.gswindows.length; ++idx) {
            if (this.gswindows[idx].layoutAllowed()) {
                windows.push(this.gswindows[idx].window);
            }
        }
        return windows;
    },
    sortedWindowsByStacking: function() {
        var windows = this.allWindows();
        return global.display.sort_windows_by_stacking(windows);
    },
    topmostWindow: function() {
        var sortedWindows = this.sortedWindowsByStacking();
        return this.getGSWindowFromWindow(sortedWindows[sortedWindows.length - 1]);
    },
    getGSWindowFromWindow: function(window) {
        if (window && window.gswindow && window.gswindow.gslayout == this) {
            return window.gswindow;
        }
        for (var idx = 0; idx < this.gswindows.length; ++idx) {
            if (this.gswindows[idx].window === window) {
                return this.gswindows[idx];
            }
        }
        return null;
    },
    numberOfWindows: function() {
        return this.gswindows.length;
    },
    indexOfWindow: function(window) {
        for (var idx = 0; idx < this.gswindows.length; ++idx) {
            if (this.gswindows[idx].window === window) {
                return idx;
            }
        }
        return -1;
    },
    gsWindowByIndex: function(index) {
        return this.gswindows[index];
    },
    swap_with_window: function(window, offset) {
        var gswindow = this.getGSWindowFromWindow(window);
        // do nothing if the current window is not in a true layout
        if (!gswindow || !gswindow.layoutAllowed()) {return;}

        var idx = 0;
        for (; idx < this.gswindows.length; ++idx) {
            if (this.gswindows[idx] == gswindow) {
                break;
            }
        }
        var oidx;
        for (oidx = (idx + offset + this.gswindows.length) % this.gswindows.length;
             oidx != idx;
             oidx = (oidx + offset + this.gswindows.length) % this.gswindows.length) {
            // find next window in layout
            if (this.gswindows[oidx].layoutAllowed()) {
                break;
            }
        }
        if (idx == oidx) {
            // same window
            return;
        }
        this.gswindows[idx] = this.gswindows[oidx];
        this.gswindows[oidx] = gswindow;
        this.relayout();
    }
});
