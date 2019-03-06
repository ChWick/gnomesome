const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Manager = Me.imports.manager;
const Logging = Me.imports.logging;

let manager;

function init() {
    global.log("[gnomesome] Initalizing log.");
    Logging.init(true);
}

function enable() {
    manager = new Manager.Manager;
}

function disable() {
    manager.destroy();
}
