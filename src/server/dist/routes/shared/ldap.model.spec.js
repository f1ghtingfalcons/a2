"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ldap_model_1 = require("./ldap.model");
describe('User Class', function () {
    it('can implement a new user with default object classes', function () {
        var user = new ldap_model_1.User('ltester', 'LDAP', 'Tester', 'ltester@fake.edu');
        expect(user.uid).toBe('ltester');
        expect(user.cn).toBe('LDAP Tester');
        expect(user.givenName).toBe('LDAP');
        expect(user.sn).toBe('Tester');
        expect(user.mail).toBe('ltester@fake.edu');
        expect(user.objectClass).toEqual(['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'inetUser', 'pwmUser']);
        expect(user.displayName).toBe('LDAP Tester');
        expect(user.userPassword).toBeDefined();
        expect(user.nsAccountLock).toBe('true');
    });
    it('can implement a new user with defined object class', function () {
        var user = new ldap_model_1.User('ltester', 'LDAP', 'Tester', 'ltester@fake.edu', ['person']);
        expect(user.objectClass).toEqual(['person']);
    });
});
describe('Group Class', function () {
    it('can implement an empty new group', function () {
        var group = new ldap_model_1.Group('Test Group');
        expect(group.cn).toBe('Test Group');
        expect(group.uniqueMember).toEqual([]);
    });
    it('can implement a new group with a user', function () {
        var group = new ldap_model_1.Group('Test Group', ['uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu']);
        expect(group.cn).toBe('Test Group');
        expect(group.uniqueMember).toEqual(['uid=ltester,ou=People,dc=lasp,dc=colorado,dc=edu']);
    });
});

//# sourceMappingURL=ldap.model.spec.js.map
