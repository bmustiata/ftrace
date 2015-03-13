var level = 0,
    runningTraces = [ [] ];

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
    var parsedItem = /^\s*at\s+((.*\.)?(.*))\((.*\:\d+:\d+)\)/.exec(stackItem)

    if (parsedItem) {
        return new SingleStackItem( parsedItem[3], parsedItem[4] );
    }

    parsedItem = /^\s*at\s+(.*\:\d+\:\d+$)/.exec(stackItem);

    if (parsedItem) {
        return new SingleStackItem( '<anonymous>', parsedItem[1] );
    }

    console.log("Unable to parse: `" + stackItem + "`");

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
     * the stack trace to solve calls.
     */
    ewrap : function(name, location, func) {
        return function() {
            var stackItems,
                enteredFunctionsCount = 0,
                i;

            try {
                var stackString;
                try { throw new Error() } catch (e) { stackString = e.stack; } // fill the stack string

                stackItems = parseStackItems(stackString);
                enteredFunctionsCount = stackItems.length - runningTraces[ runningTraces.length - 1 ].length;

                for (i = runningTraces[ runningTraces.length - 1 ].length; i < stackItems.length; i++) {
                    ftrace.enter(stackItems[i].functionName, stackItems[i].location, []);
                }
                //ftrace.enter(name, location, arguments);

                return func.apply(this, arguments);
            } finally {
                //ftrace.leave(name);
                for (i = stackItems.length - 1; i >= runningTraces[ runningTraces.length - 1 ].length; i--) {
                    ftrace.leave(stackItems[i].functionName);
                }
            }
        }
    },

    enter : function(name, location, args) {
        var stringArgs = "",
            comma = onceMany("", ", ");

        for (var i = 0; i < args.length; i++) {
            stringArgs += comma.next() + objectToString(args[i]);
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

