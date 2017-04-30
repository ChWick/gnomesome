const Lang = imports.lang;

var Modes = {
    FLOATING: {value: 0, name: "Floating"},
    MAXIMIZED: {value: 1, name: "Maximized"},
};

const Layout = new Lang.Class({
    Name: 'Gnomesome.Layout',

    _init: function() {
        this.mode = Modes.FLOATING;
        this.gswindows = [];
    },
    addGSWindow: function(gswindow) {
        if (!gswindow) {return;}
        gswindow.gslayout = this;
        var index = this.gswindows.indexOf(gswindow);
        if (index < 0) {
            // only if not in list
            this.gswindows.push(gswindow);
        }
    },
    removeGSWindow: function(gswindow) {
        if (!gswindow) {return;}
        gswindow.gslayout = null;
        var index = this.gswindows.indexOf(gswindow);
        if (index >= 0) {
            // only if in list
            this.gswindows.splice(index, 1);
        }
    },
    getGSWindowFromWindow: function(window) {
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
