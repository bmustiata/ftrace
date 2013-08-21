var onceMany = require("once-many").onceMany,
    debug = require("./debug.js");

var level = 0;

// FIXME: made the level object specific, so multiple traces can run independently - threads?
// FIXME: make the logging configurable somehow.

var ftrace = {
    /**
     * Wrap a function using an enter/leave log.
     */
    wrap : function(name, location, func) {
        return function() {
            try {
                ftrace.enter(name, location, arguments);
                return func.apply(this, arguments);
            } finally {
                ftrace.leave(name);
            }
        }
    },

    enter : function(name, location, args) {
        var stringArgs = "",
            comma = onceMany("", ", ");

        for (var i = 0; i < args.length; i++) {
            stringArgs += comma.next() + debug.objectToString(args[i]);
        }

        console.log(this._padding(level++) + "=> " + name + "(" + stringArgs +  ") : " + location);
    },

    leave : function(name) {
        console.log(this._padding(--level) + "<= " + name);
    },

    /**
     * Returns spaces padding by level, up to a lavel of 2.
     */
    _padding : function(l) {
        var i,
            result = "";

        for (i = 0; i < l; i++) {
            result = result + "  ";
        }

        return result;
    }
};

exports.wrap = ftrace.wrap;
exports.enter = ftrace.enter;
exports.leave = ftrace.leave;