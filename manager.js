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
const GSWindow = Me.imports.gswindow;

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
            Lang.bind(this, function(screen, mid, window) {
                global.log("[gnomesome] window-entered-monitor " + mid);
                var ws = window.get_workspace();
                if (ws && window.gswindow) {
                    var wid = ws.index();
                    var gslayout = this.layouts[wid][mid].addGSWindow(window.gswindow);
                }
            })
        );

        Utils.connect_and_track(this, global.screen, 'window-left-monitor',
            Lang.bind(this, function(screen, mid, window) {
                global.log("[gnomesome] window-left-monitor " + mid);
                var ws = window.get_workspace();
                if (ws && window.gswindow) {
                    var wid = ws.index();
                    var gslayout = this.layouts[wid][mid].removeGSWindow(window.gswindow);
                }
            })
        );

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
        this.handleKey("next-window",              Lang.bind(this, this.next_window));
        this.handleKey("previous-window",          Lang.bind(this, this.previous_window));
        this.handleKey("next-monitor",             Lang.bind(this, function() {this.roll_monitor(+1);}));
        this.handleKey("previous-monitor",         Lang.bind(this, function() {this.roll_monitor(-1);}));
        this.handleKey("move-to-next-monitor",     Lang.bind(this, function() {this.roll_move_to_monitor(+1);}));
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
        for (var id = 0; id < global.screen.get_n_monitors(); ++id) {
            layouts_for_monitors.push(new Layout.Layout);
        }
        this.layouts.splice(index, 0, layouts_for_monitors);

        workspace.connect("window-added", Lang.bind(this, this.window_added));
        workspace.connect("window-removed", Lang.bind(this, this.window_removed));
    },
    remove_workspace: function (index) {
        this.layouts.splice(index, 1);
    },
    update_workspaces: function () {

    },
    window_added: function(workspace, window) {
        global.log("[gnomesome] Window added " + workspace.index() + " " + window.get_monitor());
        var gslayout = this.layouts[workspace.index()][window.get_monitor()];
        if (window.gswindow) {
            gslayout.addGSWindow(window.gswindow);
            global.log("[gnomesome] Window already registered as gswindow");
        } else {
            var gswindow = new GSWindow.GSWindow(window, gslayout);
            window.gswindow = gswindow;
            gslayout.addGSWindow(gswindow);
        }
    },
    window_removed: function(workspace, window) {
        global.log("[gnomesome] Window removed " + workspace.index() + " " + window.get_monitor());
        var gslayout = this.layouts[workspace.index()][window.get_monitor()];
        if (window.gswindow) {
            gslayout.removeGSWindow(window.gswindow);
        } else {
            // global.log("[gnomesome] Error: Window without gswindow removed");
            var gswindow = gslayout.getGSWindowFromWindow(window);
            gslayout.removeGSWindow(gswindow);
        }
    },
    current_monitor_index: function() {
        var cw = global.display['focus_window'];
        if (cw) {return cw.get_monitor();}
        else {return global.screen.get_current_monitor();}
    },
    current_workspace_index: function() {
        var cw = global.display['focus_window'];
        if (cw) {return cw.get_workspace().index();}
        else {return global.screen.get_active_workspace_index();}
    },
    roll_window: function(offset) {
        var cw = global.display['focus_window'];
        var monitor = this.current_monitor_index();
        var workspace = this.current_workspace_index();
        var gslayout = this.layouts[workspace][monitor];
        var n = gslayout.numberOfWindows();
        if (!cw || n == 0) {
            // no windows on that screen and workspace
            return;
        }

        var index = gslayout.indexOfWindow(cw);
        if (index < 0) {
            global.log("[gnomesome] Warning: current window is not in layout!");
            index = 0;
        } else {
            index = (index + offset + n) % n;
        }
        var newGSWindow = gslayout.gsWindowByIndex(index);
        newGSWindow.window.activate(global.get_current_time());
    },
    next_window: function() {
        this.roll_window(+1);
    },
    previous_window: function() {
        this.roll_window(-1);
    },
    roll_monitor: function(offset) {
        var monitor = this.current_monitor_index();
        var workspace = this.current_workspace_index();
        var n_monitors = global.screen.get_n_monitors();
        var next_monitor = (monitor + offset + n_monitors) % n_monitors;
        var next_gslayout = this.layouts[workspace][next_monitor];
        // TODO: Select topmost or most recent window on that screen
        var newGSWindow = next_gslayout.gsWindowByIndex(0);
        if (newGSWindow) {
            // check if there is a window on that workspace
            newGSWindow.window.activate(global.get_current_time());
        }

    },
    roll_move_to_monitor: function(offset) {
        var midx = this.current_monitor_index();
        var cw = global.display['focus_window'];
        var n_monitors = global.screen.get_n_monitors();
        var next_midx = (midx + offset + n_monitors) % n_monitors;
        cw.move_to_monitor(next_midx);
    }
});
