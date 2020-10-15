# gnomesome

[![paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=H4Q5TXRLXM4LE&source=url)


Yet another gnome extension for window tiling inspired by awesome supporting multiple workspaces and screens.

### Suggested extensions to improve gnomesome
* To remove title bars: https://extensions.gnome.org/extension/723/pixel-saver/
* For a better multi monitor support: https://extensions.gnome.org/extension/921/multi-monitors-add-on/

### Disable Mod4+Digit keybindings (Gnome 3.32 / Ubuntu 19.04 or later)
By default the dash-to-dock extension of Ubuntu overrides all Mod4+[Shift]+Digit keybindings for selecting a workspace, or moving windows to a certain workspace.
To disable these shortcuts open the deconf-Editor, navigate to `org/gnome/shell/extensions/dash-to-dock/hot-keys` and set it to `false`, or use:
```
gsettings set org.gnome.shell.extensions.dash-to-dock hot-keys false
```

On Ubuntu 19.04 you need also to [disable all keybindings](https://askubuntu.com/questions/968103/disable-the-default-app-key-supernum-functionality-on-ubuntu-17-10-and-later) (see also [here](https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/1250)):
```
gsettings set org.gnome.shell.keybindings switch-to-application-1 []
gsettings set org.gnome.shell.keybindings switch-to-application-2 []
gsettings set org.gnome.shell.keybindings switch-to-application-3 []
gsettings set org.gnome.shell.keybindings switch-to-application-4 []
gsettings set org.gnome.shell.keybindings switch-to-application-5 []
gsettings set org.gnome.shell.keybindings switch-to-application-6 []
gsettings set org.gnome.shell.keybindings switch-to-application-7 []
gsettings set org.gnome.shell.keybindings switch-to-application-8 []
gsettings set org.gnome.shell.keybindings switch-to-application-9 []
```

### Optional: Set static workspaces
For a better feeling and working with multiple workspaces you should set the workspaces as static:
Open the Tweaks Tool and navigate to workspaces. Check `Static Workspaces` and change to your desired number of workspaces, e. g. 10. Also you might want to check `workspaces span displays`.

## Current supported layouts
* Floating
* Vertically tiled
* Horizontally tiled

## Keybindings

* `Mod4+e`: Select the next layout on the current monitor and workspace
* `Mod4+Shift+e`: Select the previous layout on the current monitor and workspace
* `Mod4+Ctrl+f`: Switch to the floating layout
* `Mod4+Ctrl+h`: Switch to the horizontal box layout
* `Mod4+Ctrl+v`: Switch to the vertical box layout
* `Mod4+Ctrl+m`: Switch to the maximized layout
* `Mod4+j`: Select the next window on the current monitor and workspace
* `Mod4+k`: Select the previous window on the current monitor and workspace
* `Mod4+Shift+j`: Swap the current client with the next client in a layout
* `Mod4+Shift+k`: Swap the current client with the previous client in a layout
* `Mod4+Ctrl+j`: Select the next monitor
* `Mod4+Ctrl+k`: Select the previous monitor
* `Mod4+o`: Move the active window to the next monitor
* `Mod4+Ctrl+Shift+j`: Move the active window to the next monitor
* `Mod4+Ctrl+Shift+k`: Move the active window to the previous monitor
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
To install the extension to the gnome-shell default path `~/.local/share/gnome-shell/extensions` run `make install`. To remove the extension run `make remove`. You need to restart gnome `Alt+F2 r` and enable the extension in the tweak tool to activate it.

To run the settings dialog you need to install clutter:
* Ubuntu: `sudo apt install gir1.2-clutter-1.0 gir1.2-clutter-gst-3.0 gir1.2-gtkclutter-1.0`
