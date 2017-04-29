const Lang = imports.lang;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuButton = Me.imports.menubutton;
const Convenience = Me.imports.convenience;

const Manager = new Lang.Class({
    Name: 'Gnomesome.Manager',

    _init: function() {
        let extension = ExtensionUtils.getCurrentExtension();
        let schema = extension.metadata['settings-keybindings'];
        this.gsettings = Convenience.getSettings(schema);
        this._bound_keybindings = {};
        this.menuButton = new MenuButton.MenuButton;
        Main.panel.addToStatusArea('gnomesome-manager', this.menuButton);

        this.initKeyBindings();
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
});
