export class Credentials {
    constructor( public username: string, public password: string ) {}
}

export function assertSanitaryUsername( username: string ) {
    try {
        assertAlphanumeric( username );
    } catch ( e ) {
        throw new Error(`
            Invalid username: ${username}
            Only alphanumeric usernames are allowed.
            If you think this is an error, please contact web.support@lasp.colorado.edu`
            .replace(/\n\s*/g, ' ')
        );
    }
}

function assertAlphanumeric( text: string ) {
    if ( !/^[a-zA-Z0-9]+$/.test( text ) ) {
        throw new Error('String is not alphanumeric (\"" + text + "\")');
    }
}
