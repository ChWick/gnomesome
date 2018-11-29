# gnomesome
Yet another gnome extension for window tiling inspired by awesome supporting multiple workspaces and screens.

## Current supported layouts
* Floating
* Vertically tiled
* Horizontally tiled

## Keybindings

* `Mod4+e`: Select the next layout on the current monitor and workspace
* `Mod4+Shift+e`: Select the previous layout on the current monitor and workspace
* `Mod4+j`: Select the next window on the current monitor and workspace
* `Mod4+k`: Select the previous window on the current monitor and workspace
* `Mod4+Shift+j`: Swap the current client with the next client in a layout
* `Mod4+Shift+k`: Swap the current client with the previous client in a layout
* `Mod4+Ctrl+j`: Select the next monitor
* `Mod4+Ctrl+k`: Select the previous monitor
* `Mod4+o`: Move the active window to the next monitor
* `Mod4+i`: Increase the master window area
* `Mod4+u`: Decrease the master window area
* `Mod4+Shift+i`: Increase the number of master windows
* `Mod4+Shift+u`: Decrease the number of master windows
* `Mod4+Ctrl+Return`: Swap the current window with the master
* `Mod4+(1-5)`: Select the workspace with id (1-5)
* `Mod4+Ctrl+(1-5)`: Move the current window to the workspace with id (1-5)
* `Mod4+Shift+m`: Toggle maximize of the current window
* `Mod4+Shift+f`: Toggle fullscreen of the current window
* `Mod4+f`: Toggle floating of the current window
* `Mod4+return`: Launch a gnome terminal

## Install
To install the extension to the gnome-shell default path `~/.local/share/gnome-shell/extensions` run `make install`. To remove the extension run `make uninstall`. You need to restart gnome `Alt+F2 r` and enable the extension in the tweak tool to activate it.

To run the settings dialog you need to install clutter:
* Ubuntu: `sudo apt install gir1.2-clutter-1.0 gir1.2-clutter-gst-3.0 gir1.2-gtkclutter-1.0`
