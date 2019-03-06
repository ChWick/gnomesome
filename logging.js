// used elsewhere in the extension to enable additional safety
// checks that "should never happen". Set to `true` when SHELLSHAPE_DEBUG=true|1|all
let PARANOID = false;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const log4js_root = Me.imports.thirdparty.log4js;
const log4js = log4js_root.log4javascript.log4javascript;
const log4js_fa = log4js_root.log4javascript_file_appender;
const log4js_gjsa = log4js_root.log4javascript_gjs_appender;

const root_logger = log4js.getLogger('gnomesome');
function getLogger(name) { return log4js.getLogger('gnomesome.' + name); }

function init(main) {
    const GLib = imports.gi.GLib;
    const GjsAppender = log4js_gjsa.init(log4js);
    const appender = new GjsAppender();
    appender.setLayout(new log4js.PatternLayout("%-5p: %m"));
    let shellshape_debug = GLib.getenv("GNOMESOME_DEBUG");

    let root_level = log4js.Level.INFO;
    root_logger.addAppender(appender);
    root_logger.setLevel(root_level);

    if (!shellshape_debug) {
        return;
    }
    const FileAppender = log4js_fa.init(log4js);
    if (main === true) {
        // only the main process should write gnomesome.log
        // (prefs.js is loaded in a separate process, and we don't
        // want that to overwrite the real logs)
        var fileAppender = new FileAppender(GLib.getenv('GNOMESOME_LOG') || "/tmp/gnomesome.log");
        fileAppender.setLayout(new log4js.PatternLayout("%d{HH:mm:ss,SSS} %-5p [%c]: %m"));
        root_logger.addAppender(fileAppender);
    }

    if (shellshape_debug === "true" || shellshape_debug === "all" || shellshape_debug === "1") {
        root_level = log4js.Level.DEBUG;
        PARANOID = true;
        root_logger.info("set log level DEBUG for gnomesome.*");

        const NotificationAppender = function NotificationAppender() { };
        NotificationAppender.prototype = new log4js.Appender();
        NotificationAppender.prototype.layout = new log4js.PatternLayout("%c: %m");
        NotificationAppender.prototype.threshold = log4js.Level.ERROR;
        NotificationAppender.prototype.append = function(loggingEvent) {
            const formattedMessage = FileAppender.getFormattedMessage(this, loggingEvent);
            imports.ui.main.notify(formattedMessage);
        };

        const notificationAppender = new NotificationAppender();
        root_logger.addAppender(notificationAppender);

    } else {
        const debug_topics = shellshape_debug.split(",");
        debug_topics.map(function(topic) {
            const log_name = "gnomesome." + topic;
            const logger = log4js.getLogger(log_name);
            logger.setLevel(log4js.Level.DEBUG);
            root_logger.info("set log level DEBUG for " + log_name);
        });
    }

}
