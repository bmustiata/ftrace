# ftrace

A simple library that traces function calls.

## Usage

For example in order to use it you can simply:
```
#!/usr/bin/env node

var ftrace = require("ftrace");

function Foo() {
    console.log("hello from foo");
}

function Moo() {
    console.log("hello from moo");
    Foo();
}

Foo = ftrace.wrap("Foo", "file.js:4", Foo);
Moo = ftrace.wrap("Moo", "file.js:8", Moo);

Moo(3, 4); // ftrace also displays the arguments nicely.
```

And you should get something like:
```
=> Moo(3, 4) : file.js:4
  => Foo() : file.js:8
  <= Foo
<= Moo
```

## ewrap

`ewrap` uses the stacktrace and can be really useful
to track where functions are called, with far less
instrumentation.

For example the following code:

```javascript
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
```

will output:

```text
=> processImmediate [as _immediateCallback] () : timers.js:345:15
  => _onImmediate () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:276:5
    => next () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:248:23
      => <anonymous>() : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:309:7
        => next () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:299:14
          => <anonymous>() : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:452:12
            => runTest () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runner.js:374:10
              => run () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runnable.js:244:7
                => callFn () : /home/raptor/.nvm/v0.10.31/lib/node_modules/mocha/lib/runnable.js:251:21
                  => <anonymous> () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:51:9
                    => callSomeWrapping () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:22:5
                      => FuncAB() : FuncAB:1
                        => FuncAB () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:17:9
                          => FuncA() : FuncA:1
                          <= FuncA
                        <= FuncAB
                        => FuncAB () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:18:9
                          => untracedFuncA () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:13:9
                            => FuncA() : FuncA:1
                            <= FuncA
                          <= untracedFuncA
                        <= FuncAB
                        => FuncAB () : /home/raptor/projects/ftrace/test/ftrace-wrap-test.js:19:9
                          => FuncB() : FuncB:1
                          <= FuncB
                        <= FuncAB
                      <= FuncAB
                    <= callSomeWrapping
                  <= <anonymous>
                <= callFn
              <= run
            <= runTest
          <= <anonymous>
        <= next
      <= <anonymous>
    <= next
  <= _onImmediate
<= processImmediate [as _immediateCallback]```
