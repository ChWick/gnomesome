const Lang = imports.lang;

var Modes = {
    FLOATING: {value: 0, name: "Floating"},
    MAXIMIZED: {value: 1, name: "Maximized"},
};

const Layout = new Lang.Class({
    Name: 'Gnomesome.Layout',

    _init: function() {
        this.mode = Modes.FLOATING;
    }
});
