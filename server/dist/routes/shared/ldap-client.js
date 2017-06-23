"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ldap = require('ldapjs');
var rxjs_1 = require("@reactivex/rxjs");
var credentials_1 = require("./credentials");
var config = require("./config");
var adminRoutes = require("../admins-routes");
var projectRoutes = require("../project-routes");
/**
 * Configuration for connecting to the LDAP server
 */
var LdapConfig = (function () {
    function LdapConfig(server, port) {
        this.url = 'ldap://' + server + ':' + port;
    }
    return LdapConfig;
}());
exports.LdapConfig = LdapConfig;
/**
 * Service for interacting with LDAP through RxJS observables
 */
var LdapClient = (function () {
    function LdapClient() {
        /*
         * If the environment is configured as production, use our production
         * credentials, otherwise, connect to a development server.
        */
        if (process.env.deploy_type === 'production') {
            console.log('Using Production LDAP Server');
            this.config = new LdapConfig(config.productionServer, '389');
            this.rootCredentials = new credentials_1.Credentials(config.productionManager, config.productionPassword);
        }
        else {
            this.config = new LdapConfig(config.developmentServer, '389');
            this.rootCredentials = new credentials_1.Credentials(config.developmentManager, config.developmentPassword);
        }
    }
    /**
     * private helper method to create an ldapjs client wrapped
     * in an Observable all at once. The Observable will automatically
     * call unbind on the client during its clean up phase.
     */
    LdapClient.prototype.ldapObservable = function (credentials, fn) {
        var _this = this;
        return rxjs_1.Observable.create(function (subscriber) {
            var client = ldap.createClient(_this.config);
            client.bind(credentials.username, credentials.password, function (err) {
                if (err) {
                    err = 'Server bind error -> ' + err;
                    subscriber.error(err);
                    return;
                }
                fn(client, subscriber);
            });
            return client.unbind; // teardown function, run onError or onComplete
        });
    };
    /**
     * search ldap for a user based on uid. Return that users DN
     */
    LdapClient.prototype.getUserByUid = function (uid) {
        var credentials = this.rootCredentials;
        var options = {
            filter: '(uid=' + uid + ')',
            scope: 'sub'
        };
        return this.ldapObservable(credentials, function (client, subscriber) {
            client.search(config.peopleBase, options, function (err, result) {
                result.on('searchEntry', function (entry) { return subscriber.next(entry.object); });
                result.on('error', function (error) { return subscriber.error(error); });
                result.on('end', function () { return subscriber.complete(); });
            });
        });
    };
    /**
     * search ldap for entries, uses default root credentials
     */
    LdapClient.prototype.search = function (base, options) {
        var credentials = this.rootCredentials;
        return this.ldapObservable(credentials, function (client, subscriber) {
            client.search(base, options, function (err, result) {
                result.on('searchEntry', function (entry) { return subscriber.next(entry.object); });
                result.on('error', function (error) { return subscriber.error(error); });
                result.on('end', function () { return subscriber.complete(); });
            });
        });
    };
    /**
     * tests whether a given username and password can bind to LDAP
     * also authorizes admins and project leads
    */
    LdapClient.prototype.authorize = function (username, password) {
        var _this = this;
        var dn;
        var credentials;
        var admins;
        var isAdmin;
        var userRegex = [];
        /**
         * Check the username validity. In the future we can implement
         * more robust checking such as people trying to login as
         * Directory manager etc.
         */
        if (username !== config.productionManager) {
            credentials_1.assertSanitaryUsername(username);
        }
        // check to see if user is master account
        if (username === config.superUser && password === config.superPass) {
            return rxjs_1.Observable.of({
                isAdmin: true,
                userRegex: null
            });
        }
        return this.getUserByUid(username).map(function (user) {
            dn = user.dn;
            credentials = new credentials_1.Credentials(dn, password);
            // check to see if user is an admin
            admins = adminRoutes.getAdmins();
            isAdmin = admins.hasOwnProperty(username);
            // check to see if the user is a project lead
            var projects = projectRoutes.getProjects();
            var _loop_1 = function (key) {
                if (user.memberOf) {
                    if (Array.isArray(user.memberOf)) {
                        user.memberOf.forEach(function (group) {
                            if (group === 'cn=' + projects[key].group + ',ou=groups,dc=lasp,dc=colorado,dc=edu') {
                                userRegex.push(projects[key].regex);
                            }
                        });
                    }
                    else {
                        if (user.memberOf === 'cn=' + projects[key].group + ',ou=groups,dc=lasp,dc=colorado,dc=edu') {
                            userRegex.push(projects[key].regex);
                        }
                    }
                }
            };
            for (var key in projects) {
                _loop_1(key);
            }
        }).switchMap(function (user) {
            return _this.ldapObservable(credentials, function (client, subscriber) {
                subscriber.next({
                    isAdmin: isAdmin,
                    userRegex: userRegex
                });
                subscriber.complete();
            });
        });
    };
    /**
     * add an object into ldap
     */
    LdapClient.prototype.add = function (base, object) {
        var credentials = this.rootCredentials;
        return this.ldapObservable(credentials, function (client, subscriber) {
            client.add(base, object, function (err) {
                if (err) {
                    err = 'Server add error -> ' + err;
                    subscriber.error(err);
                }
                subscriber.complete();
            });
        });
    };
    ;
    /**
     * delete an object from ldap using dn
     */
    LdapClient.prototype.delete = function (dn) {
        var credentials = this.rootCredentials;
        return this.ldapObservable(credentials, function (client, subscriber) {
            client.del(dn, function (err) {
                if (err) {
                    err = 'Server del error -> ' + err;
                    subscriber.error(err);
                }
                subscriber.complete();
            });
        });
    };
    /**
     * update an instance with a change
     */
    LdapClient.prototype.update = function (dn, changes) {
        var credentials = this.rootCredentials;
        var changeArray;
        if (!Array.isArray(changes)) {
            changeArray = [changes];
        }
        else {
            changeArray = changes;
        }
        changeArray = changeArray.map(function (change) { return new ldap.Change(change); });
        return this.ldapObservable(credentials, function (client, subscriber) {
            client.modify(dn, changeArray, function (err) {
                if (err) {
                    err = 'Server modify error -> ' + err;
                    subscriber.error(err);
                }
                subscriber.complete();
            });
        });
    };
    return LdapClient;
}());
exports.LdapClient = LdapClient;

//# sourceMappingURL=ldap-client.js.map
