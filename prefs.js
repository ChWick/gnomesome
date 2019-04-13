/* -*- mode: js; js-basic-offset: 4; indent-tabs-mode: spaces -*- */

const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib
const Config = imports.misc.config;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const GnomesomeSettings = Me.imports.gnomesome_settings;

const Gettext = imports.gettext.domain('gnomesome');
const _ = Gettext.gettext;


function init(){
    // TODO: Translation
    // GnomesomeSettings.initTranslations();
}

function buildPrefsWidget() {
    let settings = new GnomesomeSettings.Prefs();
    
    let frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 10
    });

    let vbox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 14
    });

    // General
    // ===============================================================
    
    (function() {
        let label = new Gtk.Label({
            label: _("<b>General:</b>"),
            use_markup: true,
            xalign: 0
        });
        vbox.add(label)
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });
        var label = new Gtk.Label({ label: _("Launch new terminal command:")} );
        var textfield = new Gtk.Entry();
        hbox.pack_start(label, false, false, 0);
        hbox.pack_start(textfield, false, false, 0);
        vbox.add(hbox);

        var pref = settings.LAUNCH_TERMINAL;
        textfield.set_text(pref.get());
        textfield.connect('activate', function() {
            pref.set(textfield.get_text());
        });
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });

        var checkbutton = new Gtk.CheckButton({ label: _("Show indicator in status panel") });

        hbox.pack_end(checkbutton, true, true, 0);
        vbox.add(hbox);

        var pref = settings.SHOW_INDICATOR;
        checkbutton.set_active(pref.get());
        checkbutton.connect('toggled', function(sw) {
            var newval = sw.get_active();
            if (newval !== pref.get()) {
                pref.set(newval);
            }
        });
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });

        var checkbutton = new Gtk.CheckButton({ label: _("Pointer follows focus") });

        hbox.pack_end(checkbutton, true, true, 0);
        vbox.add(hbox);

        var pref = settings.POINTER_FOLLOWS_FOCUS;
        checkbutton.set_active(pref.get());
        checkbutton.connect('toggled', function(sw) {
            var newval = sw.get_active();
            if (newval !== pref.get()) {
                pref.set(newval);
            }
        });
    })();

    // Tiling
    // ===============================================================
    
    (function() {
        let label = new Gtk.Label({
            label: _("<b>Tiling:</b>"),
            use_markup: true,
            xalign: 0
        });
        vbox.add(label);
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });

        var label = new Gtk.Label({ label: _("Default layout:"), });
        var radio_box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 2
        });
        var r_floating = new Gtk.RadioButton(  { label: _("Floating") });
        var r_vertical = new Gtk.RadioButton(  { label: _("Vertical"),   group: r_floating });
        var r_horizontal = new Gtk.RadioButton({ label: _("Horizontal"), group: r_floating });
        var r_maximized = new Gtk.RadioButton({ label: _("Maximized"), group: r_floating });

        var layout_radios =
        {
            'floating': r_floating,
            'horizontal': r_horizontal,
            'vertical': r_vertical,
            'maximized': r_maximized
        };

        var pref = settings.DEFAULT_LAYOUT;
        var active = layout_radios[pref.get()];
        if(active) {
            active.set_active(true);
        }
        var init_radio = function(k) {
            var radio = layout_radios[k];
            radio.connect('toggled', function() {
                if(radio.get_active()) {
                    pref.set(k);
                }
            });
            radio_box.add(radio);
        };
        init_radio('floating');
        init_radio('vertical');
        init_radio('horizontal');
        init_radio('maximized');

        hbox.add(label);
        hbox.add(radio_box);
        vbox.add(hbox);
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });
        var label = new Gtk.Label({ label: _("Inner gaps:")} );
        var spin = new Gtk.SpinButton();
        spin.set_range(0, 100);
        spin.set_increments(1, 5);
        hbox.add(label);
        hbox.add(spin);
        vbox.add(hbox);

        var pref = settings.INNER_GAPS;
        spin.set_value(pref.get());
        spin.connect('value-changed', function() {
            pref.set(spin.get_value_as_int());
        });
    })();

    (function() {
    		var hbox = new Gtk.Box({
    				orientation: Gtk.Orientation.HORIZONTAL,
    				spacing: 20
    		});
    		var label = new Gtk.Label({ label: _("Outer gaps:")} );
    		var spin = new Gtk.SpinButton();
    		spin.set_range(0, 100);
    		spin.set_increments(1, 5);
    		hbox.add(label);
    		hbox.add(spin);
    		vbox.add(hbox);

    		var pref = settings.OUTER_GAPS;
    		spin.set_value(pref.get());
    		spin.connect('value-changed', function() {
    				pref.set(spin.get_value_as_int());
    		});
    })();

    let sep = new Gtk.HSeparator();
    vbox.add(sep);

    // Keybindings
    // ===============================================================
    
    (function() {
        let label = new Gtk.Label({
            label: _("<b>Advanced settings:</b>"),
            use_markup: true,
            xalign: 0
        });
        vbox.add(label);
    })();

    (function() {
        var hbox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 20
        });

        var label = new Gtk.Label({
            label: _("Edit keyboard settings") +
                "\n<small>"+_("(make sure you have dconf-editor installed)")+"\n" +
                _("Navigate to")+" org/gnome/shell/extensions/gnomesome.keybindings</small>",
            use_markup: true});
        var button = new Gtk.Button({
            label: 'dconf-editor'
        });
        var error_msg = new Gtk.Label();
        button.connect('clicked', function(sw) {
            try {
                // The magic sauce that lets dconf-editor see our local schema:
                var envp = GnomesomeSettings.envp_with_gnomesome_xdg_data_dir();
                GLib.spawn_async(null, ['dconf-editor'], envp, GLib.SpawnFlags.SEARCH_PATH, null);
            } catch(e) {
                error_msg.set_label(_("ERROR: Could not launch dconf-editor. Is it installed?"));
                throw e;
            }
        });

        hbox.add(label);
        hbox.pack_end(button, false, false, 0);
        vbox.add(hbox);
        vbox.add(error_msg);

    })();

    frame.add(vbox);


    frame.show_all();
    return frame;
}


