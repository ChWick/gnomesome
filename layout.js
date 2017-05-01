const Lang = imports.lang;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SplitLayout = Me.imports.splitlayout;

function floatingLayout(windows) {
    // nothing to do
}

var Modes = {
    FLOATING: 0,
    VBOXLAYOUT: 1,
    properties: {
        0: {value: 0, name: "Floating", layout: floatingLayout},
        1: {value: 1, name: "VBoxLayout", layout: SplitLayout.apply},
    },
};

const NumModes = 2;

const Layout = new GObject.Class({
    Name: 'Gnomesome.Layout',
    GTypeName: 'GnomesomeLayout',
    Properties: {
        'mode': GObject.ParamSpec.int('mode', 'ModeProperty', 'Mode property', GObject.ParamFlags.READWRITE, 0, NumModes - 1, Modes.FLOATING),
    },
    Signals: {
    },

    _init: function(params) {
        this.gswindows = [];
        this._mode = Modes.FLOATING;

        this.parent(params);
        this.connect('notify::mode', Lang.bind(this, function () {this.relayout();}));
        this.mode = Modes.VBOXLAYOUT;
    },
    destroy: function() {
        global.log("[gnomesome] Cleaning up layout.");
        for (var gsw in this.gswindows) {
            gsw.gswindow = null;
        }
        this.gswindows = [];
    },
    get mode() {
        return this._mode;
    },
    set mode(mode) {
        if (this._mode != mode) {
            this._mode = mode;
            this.notify("mode");
        }
    },
    layout_name: function() {
        return Modes.properties[this.mode].name;
    },
    layout: function() {
        return Modes.properties[this.mode].layout;
    },
    relayout: function() {
        global.log("[gnomesome] Current layout " + this.layout_name());
        this.layout()(this.gswindows);
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
    }
});
