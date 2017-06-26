// import internal modules
import { Group } from './shared/ldap.model';
import { Observable } from '@reactivex/rxjs';
import { LdapClient } from './shared/ldap-client'
import { Request, Response } from 'express';
import * as authentication from './shared/authentication';
import * as paramCheck from './shared/param-checking';
import * as responseHandler from './shared/response-handlers';
import { groupBase } from './shared/config';
const ldap = new LdapClient();
import { getProtectedGroups } from './protected-groups-routes';
import { Logger } from './shared/splunk-logger';

const ldapErrorText = 'An LDAP error occurred. See the server logs for more information.';
const logger = new Logger();

/**
 * return an array of all the users in ldap
 */
export function getAll( req: Request, res: Response ) {
    const searchAllGroups = {
        attributes: [ 'cn', 'uniqueMember' ],
        filter: '(cn=*)',
        scope: 'sub'
    };

    // get the list of 'hidden' groups
    const protectedGroups = getProtectedGroups();

    // Request ldap for a list of every group
    ldap.search( groupBase, searchAllGroups ).filter(
        // filter out 'hidden' groups
        group => {
            for ( const key in protectedGroups ) {
                if ( protectedGroups[key].dn === group.dn ) {
                    return false;
                }
            }
            return true;
        }).toArray().subscribe(
        allGroups => {
            res.json( allGroups );
        },
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        responseHandler.noop
    );
}

/**
 * Returns a group, searches by group cn
 */
export function getById( req: Request, res: Response ) {
    const cn = paramCheck.requireParams( req.params, res, ['id'] );
    if ( !cn ) {
        return;
    }

    const searchGroup = {
        filter: '(cn=' + cn + ')',
        scope: 'sub'
    };
    let group;
    ldap.search( groupBase, searchGroup ).subscribe(
        result => {
            group = result;
            res.json( group );
        },
        error => {
            responseHandler.handleServerError( error, ldapErrorText, res);
        },
        () => {
            if ( !group ) {
                res.status( 404 ).json({ error: 'Group "' + cn + '" not found' });
            }
        }
    );
}

/**
 * Updates a group record from LDAP if it exists
 */
export function update( req: Request, res: Response ) {
    const cn = paramCheck.requireParams( req.params, res, ['id'] );
    const change: any = paramCheck.requireParams( req, res, ['body']);
    if ( !cn ) {
        return;
    }
    if ( !change ) {
        return;
    }

    // check to ensure the logged in user has permission to update this group
    const { status, token } = authentication.authenticateRequest( req, false );
    if ( status === authentication.AuthStatus.Success ) {
        if ( !token.isAdmin ) {
            const validGroup = token.userRegex.some( regex => new RegExp(regex, 'gi').test(cn) );
            if ( !validGroup ) {
                res.status(401).json({ 'message': 'Not Authorized To Update this Group' });
                return;
            }
        }
    } else {
        res.status(401).json({ 'message': 'You need to login to update groups' });
        return;
    }

    const searchGroup = {
        filter: '(cn=' + cn + ')',
        scope: 'sub'
    };
    ldap.search( groupBase, searchGroup )
        .switchMap( result => ldap.update( result.dn, change ))
        .subscribe(
            responseHandler.noop,
            error => {
                responseHandler.handleServerError( error, ldapErrorText, res);
            },
            () => {
                // if we are adding new members, we want to log each users update
                if ( change.modification.uniqueMember ) {
                    if ( !Array.isArray(change.modification.uniqueMember) ) {
                        change.modification.uniqueMember = [ change.modification.uniqueMember ];
                    }
                    change.modification.uniqueMember.forEach( function( dn ) {
                        logger.info( req, {
                            action: ( change.operation === 'add' ) ? 'User Added to Group' : 'User Removed From Group',
                            target: dn.split(/[=\s,]+/)[1], // extract uid from dn
                            groupAdded: cn
                        });
                    })
                } else {
                    logger.info( req, {
                        action: 'Group Updated',
                        target: cn,
                        properties: change
                    });
                }
                res.sendStatus( 200 )
            }
        );
}
