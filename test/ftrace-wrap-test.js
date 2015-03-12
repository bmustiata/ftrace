var ftrace = require("../lib/ftrace.js");

describe('ewrap should wrap simple methods', function() {
    it('should wrap them really', function() {
        var FuncA = ftrace.wrap("FuncA", "FuncA:1", function() {
        });

        var FuncB = ftrace.wrap("FuncB", "FuncB:1", function() {
        });

        var untracedFuncA = function() {
            FuncA();
        };

        var FuncAB = ftrace.wrap("FuncAB", "FuncB:1", function() {
            FuncA();
            untracedFuncA();
            FuncB();
        });

        FuncAB();
    });
});
