const Lang = imports.lang;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SplitLayout = Me.imports.splitlayout;

function floatingLayout(windows, split_pos, n_master) {
    // nothing to do
}

var Modes = {
    FLOATING: 0,
    VBOXLAYOUT: 1,
    HBOXLAYOUT: 2,
    properties: {
        0: {value: 0, name: "Floating", layout: floatingLayout, icon: "window-tile-floating-symbolic"},
        1: {value: 1, name: "VBoxLayout", layout: SplitLayout.applyVBoxLayout, icon: "window-tile-vertical-symbolic"},
        2: {value: 2, name: "HBoxLayout", layout: SplitLayout.applyHBoxLayout, icon: "window-tile-horizontal-symbolic"},
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

    _init: function(params) {
        this.gswindows = [];
        this._mode = Modes.VBOXLAYOUT;
        this._split_pos = 0.5;
        this._n_master = 1;

        this.parent(params);
        this.connect('notify::mode', Lang.bind(this, function () {this.relayout();}));
        this.connect('notify::split-pos', Lang.bind(this, function () {this.relayout();}));
        this.connect('notify::n-master', Lang.bind(this, function () {this.relayout();}));
        this.mode = Modes.FLOATING;
    },
    destroy: function() {
        global.log("[gnomesome] Cleaning up layout.");
        for (var gsw in this.gswindows) {
            gsw.gswindow = null;
        }
        this.gswindows = [];
    },
    get mode() {return this._mode;},
    set mode(mode) { if (this._mode != mode) { this._mode = mode; this.notify("mode"); } },

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
        this.layout()(this.gswindows, this.split_pos, this.n_master);
    },
    num_layouts: function() {
        return NumModes;
    },
    roll_layout: function(offset) {
        var next_layout_id = (this.mode + offset + this.num_layouts()) % this.num_layouts();
        this.mode = next_layout_id;
        global.log("[gnomesome] New layout " + this.layout_name());
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
