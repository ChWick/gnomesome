const Me = imports.misc.extensionUtils.getCurrentExtension();
const GnomesomeSettings = Me.imports.gnomesome_settings;

function apply(gswindows, split_pos, n_master, orientation) {
    const settings = new GnomesomeSettings.Prefs();
    global.log("[gnomesome] Info: relayout max_nwindows" + gswindows.length);
    if (gswindows.length <= 0) {
        // no windows available
        return;
    }
    // check consistency and add allowed windows
    var monitor_idx = gswindows[0].get_monitor();
    var workspace = gswindows[0].get_workspace();
    var gswindows_to_layout = gswindows;
    for (var idx = 0; idx < gswindows.length; ++idx) {
        gswindows[idx].unmaximize_if_not_floating();
    }

    const work_area = workspace.get_work_area_for_monitor(monitor_idx);
    work_area.x += settings.OUTER_GAPS.get();
    work_area.y += settings.OUTER_GAPS.get();
    work_area.width -= 2 * settings.OUTER_GAPS.get();
    work_area.height -= 2 * settings.OUTER_GAPS.get();
    global.log("[gnomesome] Info: windows to layout " + gswindows_to_layout.length);

    var user = false;
    // handle dependend on number of windows
    if (gswindows_to_layout.length === 0) {
        // nothing to do
    } else if (gswindows_to_layout.length === 1) {
        // only one image, fill work area
        gswindows_to_layout[0].window.move_resize_frame(
            user,
            work_area.x, work_area.y,
            work_area.width, work_area.height);
    } else {
        // determine areas
        var gsmasters = gswindows_to_layout.slice(0, n_master);
        var gsclients = gswindows_to_layout.slice(n_master, gswindows_to_layout.length);
        global.log("[gnomesome] master client" + gsmasters.length + " " + gsclients.length);

        if (orientation === 1) {
            // Horizontal layout
            let master_width = work_area.width * split_pos - settings.INNER_GAPS.get() / 2;
            let client_width = work_area.width - master_width - settings.INNER_GAPS.get();
            if (gsclients.length === 0) {master_width = work_area.width; client_width = 0;}
            if (gsmasters.length === 0) {master_width = 0; client_width = work_area.width;}

            if (gsmasters.length > 0) {
                const sub_height = (work_area.height - (gsmasters.length - 1) * settings.INNER_GAPS.get()) / gsmasters.length;
                for (let idx = 0; idx < gsmasters.length; ++idx) {
                    // first image half size, all others in rows
                    gsmasters[idx].window.move_resize_frame(
                        user,
                        work_area.x,
                        work_area.y + idx * (sub_height + settings.INNER_GAPS.get()),
                        master_width, sub_height);
                }
            }

            if (gsclients.length > 0) {
                const sub_height = (work_area.height - (gsclients.length - 1) * settings.INNER_GAPS.get()) / gsclients.length;
                for (let idx = 0; idx < gsclients.length; ++idx) {
                    gsclients[idx].window.move_resize_frame(
                        user,
                        work_area.x + master_width + settings.INNER_GAPS.get(),
                        work_area.y + idx * (sub_height + settings.INNER_GAPS.get()),
                        client_width, sub_height);
                }
            }
        } else {
            // vertical layout
            let master_height = work_area.height * split_pos - settings.INNER_GAPS.get() / 2;
            let client_height = work_area.height - master_height - settings.INNER_GAPS.get();
            if (gsclients.length === 0) {master_height = work_area.height; client_height = 0;}
            if (gsmasters.length === 0) {master_height = 0; client_height = work_area.height;}

            if (gsmasters.length > 0) {
                const sub_width = (work_area.width - (gsmasters.length - 1) * settings.INNER_GAPS.get()) / gsmasters.length;
                for (let idx = 0; idx < gsmasters.length; ++idx) {
                    // first image half size, all others in rows
                    gsmasters[idx].window.move_resize_frame(
                        user,
                        work_area.x + idx * (sub_width + settings.INNER_GAPS.get()),
                        work_area.y,
                        sub_width, master_height);
                }
            }

            if (gsclients.length > 0) {
                var sub_width = (work_area.width - (gsclients.length - 1) * settings.INNER_GAPS.get()) / gsclients.length;
                for (let idx = 0; idx < gsclients.length; ++idx) {
                    gsclients[idx].window.move_resize_frame(
                        user,
                        work_area.x + idx * (sub_width + settings.INNER_GAPS.get()),
                        work_area.y + master_height + settings.INNER_GAPS.get(),
                        sub_width, client_height);
                }
            }
        }
    }
}

function enterVBoxLayout(gswindows, split_pos, n_master) {
}

function applyVBoxLayout(gswindows, split_pos, n_master) {
    apply(gswindows, split_pos, n_master, 1);
}

function exitVBoxLayout(gswindows, split_pos, n_master) {
}



function exitHBoxLayout(gswindows, split_pos, n_master) {
}

function applyHBoxLayout(gswindows, split_pos, n_master) {
    apply(gswindows, split_pos, n_master, 0);
}

function enterHBoxLayout(gswindows, split_pos, n_master) {
}
