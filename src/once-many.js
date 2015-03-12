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

