"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("@reactivex/rxjs");
var fs = require("fs");
var readFileStream = rxjs_1.Observable.bindNodeCallback(fs.readFile);
var writeFileStream = rxjs_1.Observable.bindNodeCallback(fs.appendFile);
var overwriteFileStream = rxjs_1.Observable.bindNodeCallback(fs.writeFile);
var encoding = 'utf8';
/**
 * This functions wraps a file read operation as an rxjs observable
 */
function readFile(file) {
    return readFileStream(file, encoding);
}
exports.readFile = readFile;
/**
 * This functions wraps a file write operation as an rxjs observable
 */
function writeFile(file, data) {
    return writeFileStream(file, data);
}
exports.writeFile = writeFile;
/**
 * This functions wraps a file write operation as an rxjs observable
 */
function overwriteFile(file, data) {
    return overwriteFileStream(file, data, encoding);
}
exports.overwriteFile = overwriteFile;

//# sourceMappingURL=fileio.js.map
