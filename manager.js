const Lang = imports.lang;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuButton = Me.imports.menubutton;
const Convenience = Me.imports.convenience;
const Utils = Me.imports.utils;
const Layout = Me.imports.layout;
const GSWindow = Me.imports.gswindow;
const GnomesomeSettings = Me.imports.gnomesome_settings;
var LaunchTerminalCmd = [];
const MainLoop = imports.mainloop;
const logging = Me.imports.logging;
const logger = logging.getLogger('Gnomesome.Manager');

var Manager = new Lang.Class({
    Name: 'Gnomesome.Manager',

    _init: function() {
        const screen = Utils.DisplayWrapper.getScreen();
        const display = Utils.DisplayWrapper.getDisplay();
        const workspace_manager = Utils.DisplayWrapper.getWorkspaceManager();

        this.layouts = [];


        let extension = ExtensionUtils.getCurrentExtension();
        let schema = extension.metadata['settings-keybindings'];
        this.gsettings = Convenience.getSettings(schema);
        this.prefs = new GnomesomeSettings.Prefs();
        this._bound_keybindings = {};

        this.initIcons();

        this.initKeyBindings();

        logger.info("Number of workspaces is " + workspace_manager.get_n_workspaces());
        for (var id = 0; id < workspace_manager.get_n_workspaces(); ++id) {
            this.prepare_workspace(id);
        }

        Utils.connect_and_track(this, workspace_manager, 'workspace-added',
            Lang.bind(this, function(screen, id) {
                logger.debug("Workspace added " + id);
                this.prepare_workspace(id);
            })
        );
        Utils.connect_and_track(this, workspace_manager, 'workspace-removed',
            Lang.bind(this, function(screen, id) {
                logger.debug("Workspace removed " + id);
                this.remove_workspace(id);
            })
        );

        Utils.connect_and_track(this, screen, 'window-entered-monitor',
            Lang.bind(this, function(screen, mid, window) {
                logger.debug("window-entered-monitor " + mid);
                var ws = window.get_workspace();
                if (ws && window.gswindow) {
                    var wid = ws.index();
                    var gslayout = this.layouts[wid][mid].addGSWindow(window.gswindow);
                }
            })
        );

        Utils.connect_and_track(this, screen, 'window-left-monitor',
            Lang.bind(this, function(screen, mid, window) {
                logger.debug("window-left-monitor " + mid);
                var ws = window.get_workspace();
                if (ws && window.gswindow) {
                    var wid = ws.index();
                    var gslayout = this.layouts[wid][mid].removeGSWindow(window.gswindow);
                }
            })
        );

        Utils.connect_and_track(this, screen, 'notify::focus-window',
            Lang.bind(this, function(display, window) {
                // update current display
            })
        );

        Utils.connect_and_track(this, display, 'window-created',
            Lang.bind(this, function(display, window, user_data) {
                const cl = this.current_layout();
                if (cl) {cl.relayout();}
            })
        );

        Utils.connect_and_track(this, display, 'grab-op-end',
            Lang.bind(this, function(display, screen, window, grabop, user_data) {
                this.current_layout().relayout();
            })
        );

        this.initSettingsMonitor();
        this.initLaunchTerminalMonitor();
    },
    destroy: function() {
        this.releaseKeyBindings();
        if (this.menuButton) { this.menuButton.destroy(); }
        Utils.disconnect_tracked_signals(this);
        while (this.layouts.length > 0) {
            this.remove_workspace(0);
        }
        //this.parent();
    },
    initKeyBindings: function() {
        this.handleKey("next-layout",              Lang.bind(this, function() {this.current_layout().roll_layout(+1);}));
        this.handleKey("previous-layout",          Lang.bind(this, function() {this.current_layout().roll_layout(-1);}));
        this.handleKey("next-window",              Lang.bind(this, this.next_window));
        this.handleKey("previous-window",          Lang.bind(this, this.previous_window));
        this.handleKey("swap-with-next-window",            Lang.bind(this, function() {this.current_layout().swap_with_window(this.current_window(), +1);}));
        this.handleKey("swap-with-previous-window",        Lang.bind(this, function() {this.current_layout().swap_with_window(this.current_window(), -1);}));
        this.handleKey("next-monitor",             Lang.bind(this, function() {this.roll_monitor(+1);}));
        this.handleKey("previous-monitor",         Lang.bind(this, function() {this.roll_monitor(-1);}));
        this.handleKey("move-to-next-monitor-alt", Lang.bind(this, function() {this.roll_move_to_monitor(+1);}));
        this.handleKey("move-to-next-monitor",     Lang.bind(this, function() {this.roll_move_to_monitor(+1);}));
        this.handleKey("move-to-previous-monitor", Lang.bind(this, function() {this.roll_move_to_monitor(-1);}));
        this.handleKey("increase-master-area",     Lang.bind(this, function() {this.current_layout().resize_master_area(0.05);}));
        this.handleKey("decrease-master-area",     Lang.bind(this, function() {this.current_layout().resize_master_area(-0.05);}));
        this.handleKey("increase-n-master",     Lang.bind(this, function() {this.current_layout().increment_n_master(+1);}));
        this.handleKey("decrease-n-master",     Lang.bind(this, function() {this.current_layout().increment_n_master(-1);}));
        this.handleKey("swap-window-with-master",  Lang.bind(this, function() {this.current_layout().set_master(this.current_window()); }));
        this.handleKey("set-workspace-1",    Lang.bind(this, function() {this.set_workspace(0);}));
        this.handleKey("set-workspace-2",    Lang.bind(this, function() {this.set_workspace(1);}));
        this.handleKey("set-workspace-3",    Lang.bind(this, function() {this.set_workspace(2);}));
        this.handleKey("set-workspace-4",    Lang.bind(this, function() {this.set_workspace(3);}));
        this.handleKey("set-workspace-5",    Lang.bind(this, function() {this.set_workspace(4);}));
        this.handleKey("set-workspace-6",    Lang.bind(this, function() {this.set_workspace(5);}));
        this.handleKey("set-workspace-7",    Lang.bind(this, function() {this.set_workspace(6);}));
        this.handleKey("set-workspace-8",    Lang.bind(this, function() {this.set_workspace(7);}));
        this.handleKey("set-workspace-9",    Lang.bind(this, function() {this.set_workspace(8);}));
        this.handleKey("set-workspace-10",    Lang.bind(this, function() {this.set_workspace(9);}));

        this.handleKey("move-window-to-workspace-1", Lang.bind(this, function() {this.set_workspace(0, this.current_window());}));
        this.handleKey("move-window-to-workspace-2", Lang.bind(this, function() {this.set_workspace(1, this.current_window());}));
        this.handleKey("move-window-to-workspace-3", Lang.bind(this, function() {this.set_workspace(2, this.current_window());}));
        this.handleKey("move-window-to-workspace-4", Lang.bind(this, function() {this.set_workspace(3, this.current_window());}));
        this.handleKey("move-window-to-workspace-5", Lang.bind(this, function() {this.set_workspace(4, this.current_window());}));
        this.handleKey("move-window-to-workspace-6", Lang.bind(this, function() {this.set_workspace(5, this.current_window());}));
        this.handleKey("move-window-to-workspace-7", Lang.bind(this, function() {this.set_workspace(6, this.current_window());}));
        this.handleKey("move-window-to-workspace-8", Lang.bind(this, function() {this.set_workspace(7, this.current_window());}));
        this.handleKey("move-window-to-workspace-9", Lang.bind(this, function() {this.set_workspace(8, this.current_window());}));
        this.handleKey("move-window-to-workspace-10", Lang.bind(this, function() {this.set_workspace(9, this.current_window());}));

        this.handleKey("window-toggle-maximize",            Lang.bind(this, this.toggle_maximize));
        this.handleKey("window-toggle-fullscreen",          Lang.bind(this, this.toggle_fullscreen));
        this.handleKey("window-toggle-floating",            Lang.bind(this, this.toggle_floating));
        this.handleKey("launch-terminal",    function() {Util.spawn(LaunchTerminalCmd);});

    },
    releaseKeyBindings: function() {
        var display = global.display;
        for (var k in this._bound_keybindings) {
            if(!this._bound_keybindings.hasOwnProperty(k)) continue;
            var desc = "unbinding key " + k;
            this._do(function() {
                logger.debug(desc);
                if (Main.wm.removeKeybinding) {
                    Main.wm.removeKeybinding(k);
                } else {
                    display.remove_keybinding(k);
                }
            }, desc);
        }
    },

    initSettingsMonitor: function() {
        let initial = true;

        // indicator
        let indPref = this.prefs.SHOW_INDICATOR;
        let indUpdate = Lang.bind(this, function() {
            let indPref = this.prefs.SHOW_INDICATOR;
            var val = indPref.get();
            logger.debug("Setting show-indicator to " + val);
            if (val) {
                // create indicator icon
                if (!this.menuButton) {
                    this.menuButton = new MenuButton.MenuButton(this);
                    Main.panel.addToStatusArea('gnomesome-manager', this.menuButton);
                }
            } else {
                if (this.menuButton) {
                    this.menuButton.destroy();
                    this.menuButton = null;
                }
            }
        });
        Utils.connect_and_track(this, indPref.gsettings, 'changed::' + indPref.key, indUpdate);

        Utils.connect_and_track(this, this.prefs.OUTER_GAPS.gsettings, 'changed::' + this.prefs.OUTER_GAPS.key, () => this.relayout_all());
        Utils.connect_and_track(this, this.prefs.INNER_GAPS.gsettings, 'changed::' + this.prefs.INNER_GAPS.key, () => this.relayout_all());


        indUpdate();
    },

    initLaunchTerminalMonitor: function() {
        let termPref = this.prefs.LAUNCH_TERMINAL;
        let termUpdate = Lang.bind(this, function() {
            let termPref = this.prefs.LAUNCH_TERMINAL;
            var val = termPref.get();
            var array = val.split(' '); // split string into an array of words
            LaunchTerminalCmd = array.filter(function(x) {
                return (x !== (undefined || null || '')); // remove empty elements
            });
            logger.debug("Setting launch new terminal command to " + val);
        });
        Utils.connect_and_track(this, termPref.gsettings, 'changed::' + termPref.key, termUpdate);
        termUpdate();
    },

    // Utility method that binds a callback to a named keypress-action.
    handleKey: function (name, func) {
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
            logger.error("Error: failed to add keybinding handler for: " + name);
        }
    },

    initIcons: function() {
        // A BIT HACKY: add the shellshape icon directory to the current theme's search path,
        // as this seems to be the only way to get symbolic icons loading properly.
        var theme = imports.gi.Gtk.IconTheme.get_default();
        var icon_dir = Me.dir.get_child('icons').get_child('status');
        if(icon_dir.query_exists(null)) {
            logger.debug("adding icon dir: " + icon_dir.get_path());
            theme.append_search_path(icon_dir.get_path());
        } else {
            logger.error("no icon dir found at " + icon_dir.get_path() + " - assuming globally installed");
        }
    },

    // Safely execute a callback by catching any
    // exceptions and logging the traceback and a caller-provided
    // description of the action.
    _do: function(action, desc, fail) {
        try {
            logger.debug("start action: " + desc);
            action();
            return null;
        } catch (e) {
            logger.error("Uncaught error in " + desc + ": " + e + "\n" + e.stack);
            if(fail) throw e;
            return e;
        }
    },

    set_workspace: function (new_index, window) {
        if(new_index < 0 || new_index >= Utils.DisplayWrapper.getWorkspaceManager().get_n_workspaces()) {
            logger.warn("No such workspace; ignoring");
            return;
        }
        var next_workspace = Utils.DisplayWrapper.getWorkspaceManager().get_workspace_by_index(new_index);
        if(window !== undefined) {
            window.change_workspace(next_workspace);
            next_workspace.activate_with_focus(window, global.get_current_time())
        } else {
            next_workspace.activate(global.get_current_time());
        }
    },
    prepare_workspace: function (index) {
        logger.debug("Preparing workspace with index " + index)
        const workspace = Utils.DisplayWrapper.getWorkspaceManager().get_workspace_by_index(index);
        const layouts_for_monitors = [];
        for (let id = 0; id < Utils.DisplayWrapper.getScreen().get_n_monitors(); ++id) {
            logger.debug("Preparing monitor with index " + id + " for workspace with index " + index);
            let l = new Layout.Layout(this.prefs);
            l.connect("notify::mode", Lang.bind(this, function(l) {
                if (this.menuButton) { this.menuButton.setLayout(l.properties()); }
            }));
            layouts_for_monitors.push(l);
        }
        this.layouts.splice(index, 0, layouts_for_monitors);

        // add all existing windows
        const windows = workspace.list_windows();
        for (let id = 0; id < windows.length; ++id) {
            this.window_added(workspace, windows[id]);
        }

        Utils.connect_and_track(this, workspace, "window-added", Lang.bind(this, this.window_added));
        Utils.connect_and_track(this, workspace, "window-removed", Lang.bind(this, this.window_removed));
    },
    remove_workspace: function (index) {
        logger.debug("Removing workspace with index " + index)
        var layouts_for_monitors = this.layouts[index];
        for (var lidx = 0; lidx < layouts_for_monitors.length; ++lidx) {
            layouts_for_monitors[lidx].destroy();
        }
        this.layouts.splice(index, 1);
    },
    update_workspaces: function () {

    },
    window_added: function(workspace, window) {
        logger.debug("Window added " + workspace.index() + " " + window.get_monitor());
        var gslayout = this.layouts[workspace.index()][window.get_monitor()];
        var gswindow = window.gswindow;
        if (window.gswindow) {
            gslayout.addGSWindow(window.gswindow);
            logger.debug("Window already registered as gswindow");
        } else {
            gswindow = new GSWindow.GSWindow(window, gslayout);
            window.gswindow = gswindow;
            gslayout.addGSWindow(gswindow);
        }
        // attempt to relayout, but we need to wait until the window is ready
        logger.debug("Waiting until window is ready");
        var attempt = function(remainingAttempts) {
            if (gswindow.is_ready()) {
                MainLoop.timeout_add(50, function() {
                    gswindow.reset();
                    gslayout.relayout();
                    });
            } else {
                if (remainingAttempts === 0) {
                    logger.warn("To many attempts to relayout");
                } else {
                    MainLoop.timeout_add(10, function() {
                        attempt(remainingAttempts - 1);
                    });
                }
            }
        };
        attempt(50);
    },
    window_removed: function(workspace, window) {
        logger.debug("Window removed " + workspace.index() + " " + window.get_monitor());
        const gslayout = this.layouts[workspace.index()][window.get_monitor()];
        if (window.gswindow) {
            gslayout.removeGSWindow(window.gswindow);
        } else {
            // logger.warn("Error: Window without gswindow removed");
            const gswindow = gslayout.getGSWindowFromWindow(window);
            if (gswindow) {
                gswindow.destroy();
                gslayout.removeGSWindow(gswindow);
            }
        }
    },
    current_window: function() {
        return global.display['focus_window'];
    },
    current_monitor_index: function() {
        var cw = global.display['focus_window'];
        if (cw) {return cw.get_monitor();}
        else {return Utils.DisplayWrapper.getScreen().get_current_monitor();}
    },
    current_workspace_index: function() {
        var cw = global.display['focus_window'];
        if (cw) {return cw.get_workspace().index();}
        else {return Utils.DisplayWrapper.getWorkspaceManager().get_active_workspace_index();}
    },
    current_layout: function() {
        var cm = this.current_monitor_index();
        var cw = this.current_workspace_index();
        logger.debug("Current window/monitor: " + cw + "/" + cm);
        logger.debug("Current layout size: " + this.layouts.length);
        if (cw !== null && cm !== null && cw >= 0 && cm >= 0 && this.layouts.length > 0) {
            return this.layouts[cw][cm];
        }
        logger.debug("Current monitor or current window are not set cw/cm: " + cw + "/" + cm);
        return null;
    },
    relayout_all: function() {
        logger.debug("Relayouting all windows and workspaces");
        for (let i = 0; i < this.layouts.length; i++) {
            for (let j = 0; j < this.layouts[i].length; j++) {
                this.layouts[i][j].relayout();
            }
        }
    },
    roll_window: function(offset) {
        const cw = global.display['focus_window'];
        const monitor = this.current_monitor_index();
        const workspace = this.current_workspace_index();
        const gslayout = this.layouts[workspace][monitor];
        const n = gslayout.numberOfWindows();
        if (!cw || n === 0) {
            // no windows on that screen and workspace
            return;
        }

        let index = gslayout.indexOfWindow(cw);
        if (index < 0) {
            logger.warn.log("Warning: current window is not in layout!");
            index = 0;
        } else {
            index += offset;
        }

        for (let attempt = 0; attempt < n; attempt++) {
            index = (index + n) % n;
            const newGSWindow = gslayout.gsWindowByIndex(index);
            if (newGSWindow && !newGSWindow.is_minimized()) {
                newGSWindow.window.activate(global.get_current_time());
                break;
            }
            index += 1;
        }
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
        var n_monitors = Utils.DisplayWrapper.getScreen().get_n_monitors();
        var next_monitor = (monitor + offset + n_monitors) % n_monitors;
        var next_gslayout = this.layouts[workspace][next_monitor];
        var newGSWindow = next_gslayout.topmostWindow();
        if (newGSWindow) {
            // check if there is a window on that workspace
            newGSWindow.window.activate(global.get_current_time());
        }

    },
    roll_move_to_monitor: function(offset) {
        var midx = this.current_monitor_index();
        var cw = global.display['focus_window'];
        var n_monitors = Utils.DisplayWrapper.getScreen().get_n_monitors();
        var next_midx = (midx + offset + n_monitors) % n_monitors;
        cw.move_to_monitor(next_midx);
    },
    set_current_layout_mode: function(mode) {
        this.current_layout().mode = mode;
    },
    toggle_maximize: function(maximize) {
        var cw = this.current_window();
        if (!cw) {return;}
        var gswindow = cw.gswindow;
        if (maximize === true) {
            gswindow.set_maximize(true);
        } else if (maximize === false) {
            gswindow.set_maximize(false);
        } else if (cw.get_maximized()) {
            gswindow.set_maximize(false);
        } else {
            gswindow.set_maximize(true);
        }
        this.current_layout().relayout();
    },
    toggle_fullscreen: function(fullscreen) {
        var cw = this.current_window();
        if (!cw) {return;}
        if (fullscreen === true) {
            cw.make_fullscreen();
        } else if (fullscreen === false) {
            cw.unmake_fullscreen();
        } else if (cw.is_fullscreen()) {
            cw.unmake_fullscreen();
        } else {
            cw.make_fullscreen();
        }
        this.current_layout().relayout();
    },
    toggle_floating: function() {
        var gw = this.current_window().gswindow;
        gw.floating = !gw.floating;
        this.current_layout().relayout();
    },
});
