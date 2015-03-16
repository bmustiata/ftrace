var onceMany = function(once, many) {
    var firstGenerated = false;

    return {
        next : function() {
            if (firstGenerated) {
                if (typeof many === "function") {
                    return many.apply(this, arguments);
                } else {
                    return many;
                }
            } else {
                firstGenerated = true;
                if (typeof once === "function") {
                    return once.apply(this, arguments);
                } else {
                    return once;
                }
            }
        }
    }
};


var objectToString = function(item) {
    if (typeof item == "undefined") {
        return "undefined";
    }

    if (item == null) {
        return "null";
    }

    if (typeof item == "number") {
        return item;
    }

    if (typeof item == "boolean") {
        return item;
    }

    if ((typeof item == "object" && item.call && item.apply) ||
        (typeof item == "function")) {
        return "function()";
    }

    if (typeof item == "string") {
        return stringValue(item);
    }

    return "[object]";
};

var stringValue = function(item) {
    return '"' + item.replace(/"/g, "\\\"")
        .replace(/\n/g, "\\n") + '"';
};


var level = 0,
    runningTraces = [ [] ],
    outputConsole; // set the output console where the stack trace logs its stuff.

// FIXME: made the level object specific, so multiple traces can run independently - threads?
// FIXME: make the logging configurable somehow.

/**
 * SingleStackItem - A single stack parsed item.
 * @param {} functionName
 * @param {} location
 * @return {void}
 */
function SingleStackItem(functionName, location) {
    this.functionName = functionName;
    this.location = location;
}

/**
 * Parse the given stack items.
 * @param {string} stackString The stack string.
 * @return {Array<string>}
 */
function parseStackItems(stackString) {
    if (!/^Error/.test(stackString)) {
        return []; // not a stack string
    }

    var result = [];
    var stackItems = stackString.split(/\n/);
    var i;

    for (i = stackItems.length - 1; i >= 1; i--)  {
        result.push( parseSingleStackItem( stackItems[i] ) );
    }

    return result;
}

/**
 * parseSingleStackItem - Parses a single stack item.
 * @param {string} stackItem
 * @return {SingleStackItem}
 */
function parseSingleStackItem(stackItem) {
    var parsedItem = /^\s*at\s+((.*\.)?(.*))\s*\((.*\:\d+:\d+)\)/.exec(stackItem)

    if (parsedItem) {
        return new SingleStackItem( parsedItem[3], parsedItem[4] );
    }

    parsedItem = /^\s*at\s+(.*\:\d+\:\d+$)/.exec(stackItem);

    if (parsedItem) {
        return new SingleStackItem( '<anonymous>', parsedItem[1] );
    }

    outputConsole.log("Unable to parse: `" + stackItem + "`");

    return null;
}

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

    /**
     * Wraps the function call, and instead of tracing everything it uses
     * the stack trace to solve previous calls.
     */
    ewrap : function(name, location, func) {
        return function CiplogicFTraceWrapper() {
            var stackItems,
                currentCallCount,
                i;

            try {
                var stackString;
                try { throw new Error() } catch (e) { stackString = e.stack; } // fill the stack string

                stackItems = parseStackItems(stackString);
                currentCallCount = runningTraces[ runningTraces.length - 1 ].length;

                for (i = currentCallCount; i < stackItems.length; i++) {
                    if (/CiplogicFTraceWrapper/.test(stackItems[i].functionName)) {
                        continue;
                    }

                    ftrace.enter(stackItems[i].functionName, stackItems[i].location, []);
                }

                // since the wrapped method is not yet called, we need to report it called.
                ftrace.enter(name, location, arguments);

                runningTraces.push( stackItems );

                return func.apply(this, arguments);
            } finally {
                // report leaving the wrapped function
                ftrace.leave(name);

                for (i = stackItems.length - 1; i >= currentCallCount; i--) {
                    if (/CiplogicFTraceWrapper/.test(stackItems[i].functionName)) {
                        continue;
                    }

                    ftrace.leave(stackItems[i].functionName);
                }

                runningTraces.pop();
            }
        }
    },

    enter : function(name, location, args) {
        var stringArgs = "",
            comma = onceMany("", ", ");

        for (var i = 0; i < args.length; i++) {
            stringArgs += comma.next() + objectToString(args[i]);
        }

        outputConsole.log(this._padding(level++) + "=> " + name + "(" + stringArgs +  ") : " + location);
    },

    leave : function(name) {
        outputConsole.log(this._padding(--level) + "<= " + name);
    },

    /**
     * @param {object} outputConsole The output console for ftrace.
     * @param {Function} outputConsole.log The log function that will be used.
     */
    setConsole : function(outputConsoleParam) {
        outputConsole = outputConsoleParam;
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


ftrace.setConsole( global.console );

exports.wrap = ftrace.wrap;
exports.enter = ftrace.enter;
exports.leave = ftrace.leave;
exports.ewrap = ftrace.ewrap;

exports.setConsole = ftrace.setConsole;

//# sourceMappingURL=ftrace.js.map