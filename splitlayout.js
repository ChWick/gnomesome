function apply(gswindows, split_pos, n_master, orientation) {
    global.log("[gnomesome] Info: relayout max_nwindows" + gswindows.length);
    if (gswindows.length <= 0) {
        // no windows available
        return;
    }
    // check consistency and add allowed windows
    var monitor_idx = gswindows[0].get_monitor();
    var workspace = gswindows[0].get_workspace();
    var gswindows_to_layout = [];
    for (var idx = 0; idx < gswindows.length; ++idx) {
        if (monitor_idx != gswindows[idx].get_monitor()) {
            global.log("[gnomesome] Error: Inconsistent monitor. " + monitor_idx + " vs " + gswindows[idx].get_monitor());
        }
        if (workspace != gswindows[idx].get_workspace()) {
            global.log("[gnomesome] Error: Inconsistent workspace. " + workspace.index() + " vs " + gswindows[idx].get_workspace().index());
        }
        // List only windows, that can be used for layout.
        if (gswindows[idx].layoutAllowed()) {
            gswindows_to_layout.push(gswindows[idx]);
            // force all windows to be not maximized
            gswindows[idx].unmaximize_if_not_floating();
        }
    }

    var work_area = workspace.get_work_area_for_monitor(monitor_idx);
    global.log("[gnomesome] Info: windows to layout " + gswindows_to_layout.length);

    var user = false;
    // handle dependend on number of windows
    if (gswindows_to_layout.length == 0) {
        // nothing to do
    } else if (gswindows_to_layout.length == 1) {
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

        if (orientation == 1) {
            // Horizontal layout
            var master_width = work_area.width * split_pos;
            if (gsclients.length == 0) {master_width = work_area.width;}
            if (gsmasters.length == 0) {master_width = 0;}
            var client_width = work_area.width - master_width;

            if (gsmasters.length > 0) {
                var sub_height = work_area.height / gsmasters.length;
                for (let idx = 0; idx < gsmasters.length; ++idx) {
                    // first image half size, all others in rows
                    gsmasters[idx].window.move_resize_frame(
                        user,
                        work_area.x,
                        work_area.y + idx * sub_height,
                        master_width, sub_height);
                }
            }

            if (gsclients.length > 0) {
                var sub_height = work_area.height / gsclients.length;
                for (let idx = 0; idx < gsclients.length; ++idx) {
                    gsclients[idx].window.move_resize_frame(
                        user,
                        work_area.x + master_width,
                        work_area.y + idx * sub_height,
                        client_width, sub_height);
                }
            }
        } else {
            // vertical layout
            var master_height = work_area.height * split_pos;
            if (gsclients.length == 0) {master_height = work_area.height;}
            if (gsmasters.length == 0) {master_height = 0;}
            var client_height = work_area.height - master_height;

            if (gsmasters.length > 0) {
                var sub_width = work_area.width / gsmasters.length;
                for (let idx = 0; idx < gsmasters.length; ++idx) {
                    // first image half size, all others in rows
                    gsmasters[idx].window.move_resize_frame(
                        user,
                        work_area.x + idx * sub_width,
                        work_area.y,
                        sub_width, master_height);
                }
            }

            if (gsclients.length > 0) {
                var sub_width = work_area.width / gsclients.length;
                for (let idx = 0; idx < gsclients.length; ++idx) {
                    gsclients[idx].window.move_resize_frame(
                        user,
                        work_area.x + idx * sub_width,
                        work_area.y + master_height,
                        sub_width, client_height);
                }
            }
        }
    }
}
function applyVBoxLayout(gswindows, split_pos, n_master) {
    apply(gswindows, split_pos, n_master, 1);
}

function applyHBoxLayout(gswindows, split_pos, n_master) {
    apply(gswindows, split_pos, n_master, 0);
}
