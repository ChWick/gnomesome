const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Manager = Me.imports.manager;

let manager;

function init() {
}

function enable() {
    manager = new Manager.Manager;
}

function disable() {
    manager.destroy();
}
