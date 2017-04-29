const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;

const MenuButton = new Lang.Class({
    Name: 'Gnomesome.MenuButton',
    Extends: PanelMenu.Button,

    _init: function(){
        this.parent(0.0, _("Gnomesome MenuButton"));

        this._currentWorkspace = global.screen.get_active_workspace().index();
        this.statusLabel = new St.Label({ y_align: Clutter.ActorAlign.CENTER,
                                          text: "0" });

        this.actor.add_actor(this.statusLabel);
        this._screenSignals = [];
        this._screenSignals.push(global.screen.connect_after(
            'workspace-switched',
            Lang.bind(this, this._updateIndicator)));

        this._screenSignals.push(global.screen.connect_after(
            'window-entered-monitor',
            Lang.bind(this, this._updateIndicator)));

        this._screenSignals.push(global.screen.connect_after(
            'window-left-monitor',
            Lang.bind(this, this._updateIndicator)));

        this._screenSignals.push(global.display.connect_after(
            'notify::focus-window',
            Lang.bind(this, this._updateIndicator)));

        this._updateIndicator();
    },
    destroy: function() {
        for (let i = 0; i < this._screenSignals.length; i++) {
            global.screen.disconnect(this._screenSignals[i]);
        }
        this.parent();
    },
    _updateIndicator: function() {
        this._currentWorkspace = global.screen.get_active_workspace().index();
        var current_window = global.display['focus-window'];
        var monitor = 0;
        if (current_window) {
            monitor = current_window.get_monitor();
        }
        this.statusLabel.set_text("W" + (this._currentWorkspace + 1).toString()
                                + "M" + monitor);
    },
});
