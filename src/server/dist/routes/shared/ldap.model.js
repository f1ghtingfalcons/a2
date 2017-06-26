"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
/** LDAP user object */
var User = (function () {
    function User(uid, firstName, lastName, mail, objectClass, userPassword) {
        if (objectClass === void 0) { objectClass = ['top', 'person', 'organizationalPerson', 'inetOrgPerson', 'inetUser', 'pwmUser']; }
        if (userPassword === void 0) { userPassword = crypto.randomBytes(20).toString('hex'); }
        this.uid = uid;
        this.mail = mail;
        this.objectClass = objectClass;
        this.userPassword = userPassword;
        this.nsAccountLock = 'true';
        this.cn = firstName + ' ' + lastName;
        this.givenName = firstName;
        this.sn = lastName;
        this.displayName = firstName + ' ' + lastName;
    }
    return User;
}());
exports.User = User;
/** LDAP Group Object */
var Group = (function () {
    function Group(cn, uniqueMember) {
        if (uniqueMember === void 0) { uniqueMember = []; }
        this.cn = cn;
        this.uniqueMember = uniqueMember;
    }
    return Group;
}());
exports.Group = Group;

//# sourceMappingURL=ldap.model.js.map
