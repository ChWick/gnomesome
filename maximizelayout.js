function enterMaximizeLayout(gswindows, split_pos, n_master) {
}

function updateMaximizeLayout(gswindows, split_pos, n_master) {
    for (var idx = 0; idx < gswindows.length; ++idx) {
        // we do not want to change the floating status of the window
        gswindows[idx].set_maximize(true, false);
    }
}

function exitMaximizeLayout(gswindows, split_pos, n_master) {
}
