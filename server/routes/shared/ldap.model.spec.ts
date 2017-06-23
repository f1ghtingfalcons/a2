import { User, Group } from './ldap.model';

describe('User Class', function() {
    it('can implement a new user with default object classes', function() {
        const user = new User('ltester', 'LDAP', 'Tester', 'ltester@fake.edu');
        expect( user.uid           ).toBe('ltester');
        expect( user.cn            ).toBe('LDAP Tester');
        expect( user.givenName     ).toBe('LDAP');
        expect( user.sn            ).toBe('Tester');
        expect( user.mail          ).toBe('ltester@fake.edu');
        expect( user.objectClass   ).toEqual([ 'top', 'person', 'organizationalPerson', 'inetOrgPerson', 'inetUser', 'pwmUser' ]);
        expect( user.displayName   ).toBe('LDAP Tester');
        expect( user.userPassword  ).toBeDefined();
        expect( user.nsAccountLock ).toBe('true');
    });
    it('can implement a new user with defined object class', function() {
        const user = new User( 'ltester', 'LDAP', 'Tester', 'ltester@fake.edu', ['person'] );
        expect( user.objectClass ).toEqual( ['person'] );
    });
});

describe('Group Class', function() {
    it('can implement an empty new group', function() {
        const group = new Group('Test Group');
        expect( group.cn           ).toBe('Test Group');
        expect( group.uniqueMember ).toEqual( [] );
    });
    it('can implement a new group with a user', function() {
        const group = new Group('Test Group', ['uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu']);
        expect( group.cn           ).toBe('Test Group');
        expect( group.uniqueMember ).toEqual( ['uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu'] );
    });
});
