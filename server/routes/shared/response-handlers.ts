import { Response } from 'express';

export function handleServerError( err: any, message: string, res: Response ) {
    res.status( 500 ).json({ error: message + ' Err: ' + err });
    console.error( err );
}

export function noop() {}
