// use the locally created ldap server
// process.env.deploy_type = 'testing';

import { LdapClient, LdapConfig } from './ldap-client';
import { User } from './ldap.model';

const noop = function() {};
const ldapClient = new LdapClient();

describe('LDAP Client', function() {
    it('can create an LDAP configuration object', function() {
        const ldapConfig = new LdapConfig('test-serve', '1234');
        expect( ldapConfig.url      ).toBe('ldap://test-serve:1234');
    });
    it('can add a user to the ldap database', function( done ) {
        const base = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu'
        const user = new User( 'ltester', 'LDAP', 'Tester', 'ltester@fake.edu', undefined, 'supersecret' );
        let error = null;
        ldapClient.add( base, user).subscribe(
            ret => console.log( ret ),
            err => {
                error = err;
                expect( error ).toBe( null );
                console.log('Add user Error: ' + error );
                done();
            },
            () => {
                expect(error).toBe(null);
                done();
            }
        )
    });
    it('can add a property to a user', function( done ) {
        const dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        let error = null;
        const changes = [{
            operation: 'replace',
            modification: {
                nsAccountLock: 'false'
            }
        }];
        ldapClient.update( dn, changes ).subscribe(
            ret => console.log( ret ),
            err => {
                error = err;
                // We don't actually expect error to be null, just need this to fail if an error is thrown
                expect( error ).toBe(null);
                console.log('Change user Error: ' + error);
                done();
            },
            () => {
                expect(error).toBe(null);
                done();
            }
        )
    });
    it('errors on invalid credentials', function( done ) {
        const username = 'ltester'
        const password = 'imtryingtohack!';
        let error: Error = null;
        ldapClient.authorize( username, password ).subscribe(
            noop,
            err => {
                error = err;
                console.log(error);
                expect( error.toString() ).toBe('Server bind error -> InvalidCredentialsError: Invalid Credentials');
                done();
            },
            () => {
                expect( error.toString() ).toBe('Server bind error -> InvalidCredentialsError: Invalid Credentials');
                done();
            }
        )
    });
    it('can authorize a user token', function( done ) {
        const username = 'ltester'
        const password = 'supersecret';
        let error: Error = null;
        ldapClient.authorize( username, password ).subscribe(
            noop,
            err => {
                error = err;
                console.log( error );
                expect(error).toBe( null );
                done();
            },
            () => {
                expect( error ).toBe( null );
                done();
            }
        )
    });
    it('can make a search against the ldap database for the recently added user', function( done ) {
        const base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        const search = { filter: '(uid=ltester)', scope: 'sub' };
        const result = [];
        ldapClient.search( base, search ).subscribe(
            ret => {
                result.push( ret )
            },
            err => {
                if ( result.length > 0 ) {
                    expect( result[0].uid ).toBe('ltester');
                } else {
                    expect( result.length ).toBeGreaterThan( 0 );
                }
                done();
            },
            () => {
                if ( result.length > 0 ) {
                    expect( result[0].uid ).toBe('ltester');
                } else {
                    expect( result.length ).toBeGreaterThan( 0 );
                }
                done();
            }
        )
    });
    it('can add a property to a user', function( done ) {
        const dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        let error = null;
        const changes = [{
            operation: 'replace',
            modification: {
                mail: 'newemail@new.edu'
            }
        }];
        ldapClient.update( dn, changes ).subscribe(
            ret => console.log( ret ),
            err => {
                error = err;
                expect( error ).toBe( null );
                console.log('Change user Error: ' + error);
                done();
            },
            () => {
                expect( error ).toBe( null );
                done();
            }
        )
    });
    it('change should be reflected in LDAP', function( done ) {
        const base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        const search = { filter: '(uid=ltester)', scope: 'sub' };
        const result = [];
        ldapClient.search( base, search ).subscribe(
            ret => {
                result.push( ret )
            },
            err => {
                console.log(err);
                if ( result.length > 0 ) {
                    expect( result[0].mail ).toEqual('newemail@new.edu');
                } else {
                    expect( result.length ).toBeGreaterThan( 0 );
                }
                done();
            },
            () => {
                if ( result.length > 0 ) {
                    expect( result[0].mail ).toEqual('newemail@new.edu');
                } else {
                    expect( result.length ).toBeGreaterThan( 0 );
                }
                done();
            }
        )
    });
    it('can delete a user object', function( done ) {
        const dn = 'uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu';
        let error = null;
        ldapClient.delete( dn ).subscribe(
            ret => console.log( ret ),
            err => {
                error = err;
                expect( error ).toBe( null );
                console.log('Delete user Error: ' + error );
                done();
            },
            () => {
                expect( error ).toBe( null );
                done();
            }
        )
    });
    it('search results for non-existent users should be empty', function( done ) {
        const base = 'ou=People,dc=lasp,dc=colorado,dc=edu';
        const search = { filter: '(uid=ltester)', scope: 'sub' };
        const result = [];
        ldapClient.search( base, search ).subscribe(
            ret => {
                result.push( ret )
            },
            err => {
                console.log( err );
                expect( result.length ).toBe( 0 );
                expect( err ).toBe(null);
                done();
            },
            () => {
                expect( result.length ).toBe( 0 );
                done();
            }
        )
    });
});
