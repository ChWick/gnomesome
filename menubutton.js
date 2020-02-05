const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Shell = imports.gi.Shell;
const LayoutModes = Me.imports.layout.Modes;
const Gio = imports.gi.Gio;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const rootPath = Me.path;

var MenuButton = new Lang.Class({
    Name: 'Gnomesome.MenuButton',
    Extends: PanelMenu.Button,

    _init: function(manager){
        this._manager = manager;
        this.parent(0.0, _("Gnomesome MenuButton"), false);

        this._currentWorkspace = Utils.DisplayWrapper.getWorkspaceManager().get_active_workspace().index();
        this.statusLabel = new St.Label({ y_align: Clutter.ActorAlign.CENTER,
                                          text: "0" });

        // add the icon
        this.show();
        this._iconBox = new St.BoxLayout();
        this._iconIndicator = new St.Icon({
            style_class: 'system-status-icon',
            icon_name: 'gnomesome-window-tile-floating-symbolico.svg',
        });
        this._iconBox.add(this._iconIndicator);
        this.add_actor(this._iconBox);
        this.add_style_class_name('panel-status-button');

        // initialize menu
        const addLayout = (layout) => {
            const item = new PopupMenu.PopupBaseMenuItem();
            const label = new St.Label({text: layout.display});
            const icon = new St.Icon({style_class: 'system-status-icon', gicon: Gio.icon_new_for_string(rootPath + '/' +  layout.icon)});
            item.actor.add(icon, {align: St.Align.START});
            item.actor.add(label);
            this.menu.addMenuItem(item);
            item.connect('activate', () => {
                this._manager.set_current_layout_mode(layout.value);
            });
        };
        for (let v of Object.values(LayoutModes.properties)) {
            addLayout(v);
        }

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Settings
        const item = new PopupMenu.PopupBaseMenuItem()
        let label = new St.Label({text: "Gnomesome Settings"});
        let icon = new St.Icon({style_class: 'system-status-icon', icon_name: 'preferences-other'});
        item.actor.add(icon, {align: St.Align.START});
        item.actor.add(label);
        item.connect('activate', () => {
            var uuid = "gnomesome@chwick.github.com";
            var appSys = Shell.AppSystem.get_default();
            var app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
            var info = app.get_app_info();
            var timestamp = global.display.get_current_time_roundtrip();
            info.launch_uris(['extension:///' + uuid],
            global.create_app_launch_context(timestamp, -1));
        });
        this.menu.addMenuItem(item);

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
        Utils.connect_and_track(this, this,
            'scroll-event',
            Lang.bind(this, this._scrollEvent));

        this._updateIndicator();
    },
    destroy: function() {
        Utils.disconnect_tracked_signals(this);
        this.parent();
    },
    setLayout: function(layout) {
        this._iconIndicator.gicon = Gio.icon_new_for_string(rootPath + '/' +  layout.icon);
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
        if (direction === Clutter.ScrollDirection.DOWN) {
            cl.roll_layout(+1);
        } else if (direction === Clutter.ScrollDirection.UP) {
            cl.roll_layout(-1);
        }
    },
});
