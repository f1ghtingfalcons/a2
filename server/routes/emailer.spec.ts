import { Emailer, EmailProperties } from './emailer';
import { User } from './shared/ldap.model';

describe('LDAP New User Emailer', function() {
    let emailer;
    beforeEach( function() {
        emailer = new Emailer( true );
    });
    it('initializes email properties properly', function() {
        const emailProperties = new EmailProperties('test@test.edu', 'hello world');
        expect( emailProperties.from    ).toBe('pwm@lasp.colorado.edu');
        expect( emailProperties.to      ).toBe('test@test.edu');
        expect( emailProperties.subject ).toBe('LASP User Account Activation');
        expect( emailProperties.text    ).toBe('hello world');
    });
});

describe('Emailer - setting up email properties', function() {
    it('sets the email properties correctly', function() {
        const emailProperties = new EmailProperties('test@lasp.colorado.edu', 'hello world');
        const shouldBe = {
            to: 'test@lasp.colorado.edu',
            text: 'hello world',
            from: 'pwm@lasp.colorado.edu',
            subject: 'LASP User Account Activation'
        };
        expect( JSON.stringify( emailProperties )).toBe( JSON.stringify( shouldBe ));
    });
});

describe('Emailer - sending email', function() {
    let emailer;
    let info;
    let error;
    beforeEach( function( done ) {
        emailer = new Emailer( true );
        emailer.sendEmail('test@test.edu', 'hello world').subscribe(
            i => {
                info = i;
                done();
            },
            e => {
                console.error( e );
                error = e;
                done();
            }
        );
    });
    it('can send a simple email', function() {
        expect( info.envelope.to[0] ).toBe('test@test.edu');
    });
});

describe('Emailer - read file, transform and send email', function() {
    let emailer;
    let user;
    let info;
    let error;
    beforeEach( function( done ) {
        emailer = new Emailer( true );
        user = new User('testID', 'Testy', 'McTestface', 'testy.mytestface@lasp.colorado.edu');
        emailer.sendUserInvite( user ).subscribe(
            text => {
                info = text;
                done();
            },
            err => {
                error = err;
                done();
            }
        )
    });
    it('can send a simple email', function() {
        if ( error ) {
            console.log( error );
        }
        expect( info.response ).toBeDefined();
    });
});
