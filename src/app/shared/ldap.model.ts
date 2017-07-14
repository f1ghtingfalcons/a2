import * as crypto from 'crypto-browserify';

/** LDAP user object */
export class User {
    cn: string;
    dn: string;
    givenName: string;
    sn: string;
    displayName: string;
    nsAccountLock = 'true';
    groups: string[];
    invite: boolean;

    constructor(
        public uid: string,
        firstName?: string,
        lastName?: string,
        public mail?: string,
        public objectClass: string[] = [ 'top', 'person', 'organizationalPerson', 'inetOrgPerson', 'inetUser', 'pwmUser' ],
        public userPassword: string = crypto.randomBytes( 20 ).toString('hex'),
        public memberOf?: string[]
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

/** LDAP Change Object */
export class LdapChange {
    constructor( public operation: string, public modification: {} ) {}
}
