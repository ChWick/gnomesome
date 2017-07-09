function enterFloatingLayout(gswindows, split_pos, n_master) {
    // restore all window geometry
    for (var idx = 0; idx < gswindows.length; ++idx) {
        gswindows[idx].restore_geometry();
    }
}

function updateFloatingLayout(gswindows, split_pos, n_master) {

}

function exitFloatingLayout(gswindows, split_pos, n_master) {
    // store all window geomety
    for (var idx = 0; idx < gswindows.length; ++idx) {
        gswindows[idx].store_geometry();
    }
}
