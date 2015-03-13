var createClass = require("superb-class").createClass;

/**
 * A console that keeps all that gets logged into a string.
 */
var StringConsole = createClass({
    _output : null,

    /**
     * Stores the given arguments into the _output internal
     * variable.
     * @param {Object} arguments What to be stored internally.
     */
    log : function() {
        var argsAsArray = Array.prototype.slice.apply(arguments);
        var argsAsString = argsAsArray.join("  ");

        this._output += argsAsString + "\n";
    },

    /**
     * Gets what was stored so far.
     */
    getOutput : function() {
        return this._output;
    }
});

exports.StringConsole = StringConsole;

