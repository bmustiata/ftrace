window.ftrace = ftrace; // export the ftrace into the window context.

ftrace.setConsole( window.console || {
    log : function() {
        if (window.console) { // in IE8 the window.console apperas only when the console it's open
            window.console.log.apply(window.console.log, arguments);
        }
    }
});

})();
