function apply(gswindows) {
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
        // first image half size, all others in rows
        gswindows_to_layout[0].window.move_resize_frame(
            user,
            work_area.x, work_area.y,
            work_area.width / 2, work_area.height);

        var sub_height = work_area.height / (gswindows_to_layout.length - 1);
        for (var idx = 1; idx < gswindows_to_layout.length; ++idx) {
            gswindows_to_layout[idx].window.move_resize_frame(
                user,
                work_area.x + work_area.width / 2,
                work_area.y + (idx - 1) * sub_height,
                work_area.width / 2, sub_height);
        }
    }
}
