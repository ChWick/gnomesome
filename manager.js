const Lang = imports.lang;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuButton = Me.imports.menubutton;
const Convenience = Me.imports.convenience;
const Utils = Me.imports.utils;
const Layout = Me.imports.layout;

const Manager = new Lang.Class({
    Name: 'Gnomesome.Manager',

    _init: function() {
        this.layouts = [];


        let extension = ExtensionUtils.getCurrentExtension();
        let schema = extension.metadata['settings-keybindings'];
        this.gsettings = Convenience.getSettings(schema);
        this._bound_keybindings = {};
        this.menuButton = new MenuButton.MenuButton;
        Main.panel.addToStatusArea('gnomesome-manager', this.menuButton);

        this.initKeyBindings();

        for (var id = 0; id < global.screen.get_n_workspaces(); ++id) {
            this.prepare_workspace(id);
        }

        Utils.connect_and_track(this, global.screen, 'workspace-added',
            Lang.bind(this, function(screen, id) {
                global.log("[gnomesome] Workspace added " + id);
                this.prepare_workspace(id);
            })
        );
        Utils.connect_and_track(this, global.screen, 'workspace-removed',
            Lang.bind(this, function(screen, id) {
                global.log("[gnomesome] Workspace removed " + id);
                this.remove_workspace(id);
            })
        );

        Utils.connect_and_track(this, global.screen, 'window-entered-monitor',
            Lang.bind(this, function(screen, mid, window) {global.log("[gnomesome] window-entered-monitor " + mid);}));

        Utils.connect_and_track(this, global.screen, 'window-left-monitor',
            Lang.bind(this, function(screen, mid, window) {global.log("[gnomesome] window-left-monitor " + mid);}));

        var display = global.screen.get_display();
        Utils.connect_and_track(this, display, 'notify::focus-window',
            Lang.bind(this, function(display, window) {
                // update current display
            })
        );
    },
    destroy: function() {
        this.menuButton.destroy();
        this.parent();
    },
    initKeyBindings: function() {
        this.handleKey("set-workspace-1",    Lang.bind(this, function() {this.set_workspace(0);}));
        this.handleKey("set-workspace-2",    Lang.bind(this, function() {this.set_workspace(1);}));
        this.handleKey("set-workspace-3",    Lang.bind(this, function() {this.set_workspace(2);}));
        this.handleKey("set-workspace-4",    Lang.bind(this, function() {this.set_workspace(3);}));
        this.handleKey("set-workspace-5",    Lang.bind(this, function() {this.set_workspace(4);}));

        this.handleKey("launch-terminal",    function() {Util.spawn(['gnome-terminal']);});

    },

    // Utility method that binds a callback to a named keypress-action.
    handleKey: function (name, func) {
        var Meta = imports.gi.Meta;

        this._bound_keybindings[name] = true;
        var flags = Meta.KeyBindingFlags.NONE;

        // API for 3.8+ only
        var ModeType = Shell.hasOwnProperty('ActionMode') ? Shell.ActionMode : Shell.KeyBindingMode;
        var added = Main.wm.addKeybinding(
            name,
            this.gsettings,
            flags,
            ModeType.NORMAL | ModeType.OVERVIEW,
            Lang.bind(this, function() {this._do(func, "handler for binding " + name);}));
        if(!added) {
            throw("failed to add keybinding handler for: " + name);
        }
    },

    // Safely execute a callback by catching any
    // exceptions and logging the traceback and a caller-provided
    // description of the action.
    _do: function(action, desc, fail) {
        try {
            global.log("[gnomesome] start action: " + desc);
            action();
            return null;
        } catch (e) {
            global.log("[gnomesome] Uncaught error in " + desc + ": " + e + "\n" + e.stack);
            if(fail) throw e;
            return e;
        }
    },

    set_workspace: function (new_index, window) {
        if(new_index < 0 || new_index >= global.screen.get_n_workspaces()) {
            self.log("No such workspace; ignoring");
            return;
        }
        var next_workspace = global.screen.get_workspace_by_index(new_index);
        if(window !== undefined) {
            window.move_to_workspace(new_index);
            next_workspace.activate_with_focus(window, global.get_current_time())
        } else {
            next_workspace.activate(global.get_current_time());
        }
    },
    prepare_workspace: function (index) {
        var workspace = global.screen.get_workspace_by_index(index);
        var layouts_for_monitors = [];
        for (var id = 0; id < global.screen.get_n_monitors; ++id) {
            layouts_for_monitors = new Layout.Layout;
        }
        this.layouts.splice(index, 0, layouts_for_monitors);
    },
    remove_workspace: function (index) {
        this.layouts.splice(index, 1);
    },
    update_workspaces: function () {

    }
});
