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

exports.objectToString = objectToString;