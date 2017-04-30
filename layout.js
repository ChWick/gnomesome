const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SplitLayout = Me.imports.splitlayout;

function floatingLayout(windows) {
    // nothing to do
}

var Modes = {
    FLOATING: {value: 0, name: "Floating", layout: floatingLayout},
    VBOXLAYOUT: {value: 1, name: "VBoxLayout", layout: SplitLayout.apply},
};

const Layout = new Lang.Class({
    Name: 'Gnomesome.Layout',

    _init: function() {
        this.mode = Modes.VBOXLAYOUT;
        this.gswindows = [];
    },
    destroy: function() {
        global.log("[gnomesome] Cleaning up layout.");
        for (var gsw in this.gswindows) {
            gsw.gswindow = null;
        }
        this.gswindows = [];
    },
    relayout: function() {
        this.mode.layout(this.gswindows);
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
