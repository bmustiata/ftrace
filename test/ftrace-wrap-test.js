var ftrace = require("../lib/ftrace.js"),
    StringConsole = require("./string-console.js").StringConsole,
    assert = require("assert");

function callSomeWrapping() {
    var FuncA = ftrace.ewrap("FuncA", "FuncA:1", function FuncA() {
    });

    var FuncB = ftrace.ewrap("FuncB", "FuncB:1", function FuncB() {
    });

    var untracedFuncA = function() {
        FuncA();
    };

    var FuncAB = ftrace.ewrap("FuncAB", "FuncAB:1", function FuncAB() {
        FuncA();
        untracedFuncA();
        FuncB();
    });

    FuncAB();
}

describe('ewrap should wrap simple methods', function() {
    it('should wrap them really', function() {
        var log = new StringConsole();
        ftrace.setConsole(log);

        callSomeWrapping();

        var output = log.getOutput();

        assert( /ftrace-wrap-test.js/.test(output) );
    });

    it('wrapper methos shouldn\'t appear in the stacktrace', function() {
        var log = new StringConsole();
        ftrace.setConsole(log);

        callSomeWrapping();

        var output = log.getOutput();
        assert( ! /\/ftrace\.js\W/.test(output) );
    });

    it('internally called methods should all appear.', function() {
        var log = new StringConsole();
        ftrace.setConsole(log);

        callSomeWrapping();

        var output = log.getOutput();

        assert( /\WFuncA\W/.test(output), "FuncA not present in the output.");
        assert( /\WFuncB\W/.test(output), "FuncB not present in the output." );
        assert( /\WFuncAB\W/.test(output), "FuncAB not present in the output." );
    });
});

