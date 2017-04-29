const Lang = imports.lang;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuButton = Me.imports.menubutton;
const Convenience = Me.imports.convenience;

const Manager = new Lang.Class({
    Name: 'Gnomesome.Manager',

    _init: function() {
        this.menuButton = new MenuButton.MenuButton;
        Main.panel.addToStatusArea('gnomesome-manager', this.menuButton);

        this.initKeyBindings();
    },
    destroy: function() {
        this.menuButton.destroy();
    },
    initKeyBindings: function() {
        let extension = ExtensionUtils.getCurrentExtension();
        let schema = extension.metadata['settings-keybindings'];
        var Meta = imports.gi.Meta;
        var gsettings = Convenience.getSettings(schema);

        // Utility method that binds a callback to a named keypress-action.
        function handle(name, func) {
            self._bound_keybindings[name] = true;
            var handler = function() { self._do(func, "handler for binding " + name); };
            var flags = Meta.KeyBindingFlags.NONE;

            // API for 3.8+ only
            var KeyBindingMode = Shell.ActionMode ? "ActionMode" : "KeyBindingMode";
            var added = Main.wm.addKeybinding(
                name,
                gsettings,
                flags,
                Shell[KeyBindingMode].NORMAL | Shell[KeyBindingMode].MESSAGE_TRAY,
                handler);
            if(!added) {
                throw("failed to add keybinding handler for: " + name);
            }
        };

        handle("set-workspace-1",    function() {});
        handle("set-workspace-2",    function() {});
    },
});
