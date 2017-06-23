import crypto = require( 'crypto' );

/** LDAP user object */
export class User {
    cn: string;
    givenName: string;
    sn: string;
    displayName: string;
    nsAccountLock = 'true';

    constructor(
        public uid: string,
        firstName?: string,
        lastName?: string,
        public mail?: string,
        public objectClass: string[] = [ 'top', 'person', 'organizationalPerson', 'inetOrgPerson', 'inetUser', 'pwmUser' ],
        public userPassword: string = crypto.randomBytes( 20 ).toString('hex')
    ) {
        this.cn = firstName + ' ' + lastName;
        this.givenName = firstName;
        this.sn = lastName;
        this.displayName = firstName + ' ' + lastName;
    }
}

/** LDAP Group Object */
export class Group {
    constructor( public cn: string, public uniqueMember: string[] = [] ) {}
}
