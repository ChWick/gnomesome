const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const MenuButton = new Lang.Class({
    Name: 'Gnomesome.MenuButton',
    Extends: PanelMenu.Button,

    _init: function(manager){
        this._manager = manager;
        this.parent(0.0, _("Gnomesome MenuButton"));

        this._currentWorkspace = Utils.DisplayWrapper.getWorkspaceManager().get_active_workspace().index();
        this.statusLabel = new St.Label({ y_align: Clutter.ActorAlign.CENTER,
                                          text: "0" });

        // add the icon
        this.actor.show()
        this._iconBox = new St.BoxLayout();
        this._iconIndicator = new St.Icon({
            style_class: 'system-status-icon',
            icon_name: 'window-tile-floating-symbolic',
        });
        this._iconBox.add(this._iconIndicator);
        this.actor.add_actor(this._iconBox);
        this.actor.add_style_class_name('panel-status-button');

        //this.actor.add_actor(this.statusLabel);

        Utils.connect_and_track(this, Utils.DisplayWrapper.getWorkspaceManager(),
            'workspace-switched',
            Lang.bind(this, this._updateIndicator));
        Utils.connect_and_track(this, Utils.DisplayWrapper.getScreen(),
            'window-entered-monitor',
            Lang.bind(this, this._updateIndicator));
        Utils.connect_and_track(this, Utils.DisplayWrapper.getScreen(),
            'window-left-monitor',
            Lang.bind(this, this._updateIndicator));
        Utils.connect_and_track(this, Utils.DisplayWrapper.getScreen(),
            'notify::focus-window',
            Lang.bind(this, this._updateIndicator));
        Utils.connect_and_track(this, this.actor,
            'scroll-event',
            Lang.bind(this, this._scrollEvent));

        this._updateIndicator();
    },
    destroy: function() {
        Utils.disconnect_tracked_signals(this);
        this.parent();
    },
    setLayout: function(layout) {
        this._iconIndicator.icon_name = layout.icon;
    },
    _updateIndicator: function() {
        this._currentWorkspace = Utils.DisplayWrapper.getWorkspaceManager().get_active_workspace().index();
        var current_window = global.display['focus-window'];
        var monitor = 0;
        if (current_window) {
            monitor = current_window.get_monitor();
        }
        this.statusLabel.set_text("W" + (this._currentWorkspace + 1).toString()
                                + "M" + monitor);

        const clayout = this._manager.current_layout();
        if (clayout) {
            this.setLayout(this._manager.current_layout().properties());
        }
    },
    _scrollEvent: function(actor, event) {
        const direction = event.get_scroll_direction();
        const cl = this._manager.current_layout();
        if (!cl) {return;}
        if (direction == Clutter.ScrollDirection.DOWN) {
            cl.roll_layout(+1);
        } else if (direction == Clutter.ScrollDirection.UP) {
            cl.roll_layout(-1);
        }
    },
});
