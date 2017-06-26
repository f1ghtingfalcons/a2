/* Security Features */
export const secret = 'thisdoesntseemverysecret';
export const tokenLifetimeDays = 1; // expire tokens after 1 day

/* Superuser credentials */
export const superUser = 'roleman';
export const superPass = 'supersecret';

/* Bases used for object searching */
export const peopleBase = 'ou=People,dc=lasp,dc=colorado,dc=edu';
export const groupBase = 'ou=groups,dc=lasp,dc=colorado,dc=edu';

/* Production Environment Setup */
export const productionServer = 'webiam-core1.lasp.colorado.edu';
export const productionManager = 'cn=Directory Manager';
export const productionPassword = 'webiamds';

/* Development Environment Setup */
// TODO: Allow this to be configured from command line
export const developmentServer = 'rhdsrvdev.lasp.colorado.edu';
export const developmentManager = productionManager;
export const developmentPassword = 'adminadmin';

// I haven't found a good way to share this config file between the client and the
// server, so this magic string is also duplicated in the client code somewhere
// (at the time of this writing it lives in src/app/components/authentication/authentication.service.js)
// If you update this value here, please be sure to also update it in the
// client code.

export const authCookieName = 'roleman-token';

export const prodSplunkHEC = 'A4D7E865-3E63-4606-867B-5F98E1E5DDDA';
export const devSplunkHEC = 'CC1FC9FE-89C3-4350-8FC5-DD095F4CDC59';
