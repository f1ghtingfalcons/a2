"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Security Features */
exports.secret = 'thisdoesntseemverysecret';
exports.tokenLifetimeDays = 1; // expire tokens after 1 day
/* Superuser credentials */
exports.superUser = 'roleman';
exports.superPass = 'supersecret';
/* Bases used for object searching */
exports.peopleBase = 'ou=People,dc=lasp,dc=colorado,dc=edu';
exports.groupBase = 'ou=groups,dc=lasp,dc=colorado,dc=edu';
/* Production Environment Setup */
exports.productionServer = 'webiam-core1.lasp.colorado.edu';
exports.productionManager = 'cn=Directory Manager';
exports.productionPassword = 'webiamds';
/* Development Environment Setup */
// TODO: Allow this to be configured from command line
exports.developmentServer = 'rhdsrvdev.lasp.colorado.edu';
exports.developmentManager = exports.productionManager;
exports.developmentPassword = 'adminadmin';
// I haven't found a good way to share this config file between the client and the
// server, so this magic string is also duplicated in the client code somewhere
// (at the time of this writing it lives in src/app/components/authentication/authentication.service.js)
// If you update this value here, please be sure to also update it in the
// client code.
exports.authCookieName = 'roleman-token';
exports.prodSplunkHEC = 'A4D7E865-3E63-4606-867B-5F98E1E5DDDA';
exports.devSplunkHEC = 'CC1FC9FE-89C3-4350-8FC5-DD095F4CDC59';

//# sourceMappingURL=config.js.map
