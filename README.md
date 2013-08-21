ftrace
======

A simple library that traces function calls.

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