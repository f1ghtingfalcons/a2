"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleServerError(err, message, res) {
    res.status(500).json({ error: message + ' Err: ' + err });
    console.error(err);
}
exports.handleServerError = handleServerError;
function noop() { }
exports.noop = noop;

//# sourceMappingURL=response-handlers.js.map
