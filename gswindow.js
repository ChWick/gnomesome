const Lang = imports.lang;

const GSWindow = new Lang.Class({
    Name: 'Gnomesome.Window',

    _init: function(window, gslayout) {
        this.window = window;
        this.floating = true;
        this.gslayout = gslayout;
    },
    destroy: function() {
        this.gslayout.removeGSWindow(this);
    }
});
