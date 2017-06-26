import { Observable } from '@reactivex/rxjs';
import fs = require('fs');

const readFileStream: (path: string, encoding: string) => Observable<string> = Observable.bindNodeCallback(
    <(path: string, encoding: string, callback: (err: any, result: string) => void) => void>fs.readFile
);
const writeFileStream: (path: string, data: string) => Observable<string> = Observable.bindNodeCallback(
    <(path: string, data: string, callback: (err: any, result: string) => void) => void>fs.appendFile
);
const overwriteFileStream: (path: string, data: string, encoding: string) => Observable<string> = Observable.bindNodeCallback(
    <(path: string, data: string, encoding: string, callback: (err: any, result: string) => void) => void>fs.writeFile
);
const encoding = 'utf8';

/**
 * This functions wraps a file read operation as an rxjs observable
 */
export function readFile( file: string ): Observable<string> {
    return readFileStream( file, encoding );
}

/**
 * This functions wraps a file write operation as an rxjs observable
 */
export function writeFile( file: string, data: string ) {
    return writeFileStream( file, data )
}

/**
 * This functions wraps a file write operation as an rxjs observable
 */
export function overwriteFile( file: string, data: string ) {
    return overwriteFileStream( file, data, encoding )
}
