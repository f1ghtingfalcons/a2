import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
let jwt_decode = require('jwt-decode');

const LdapURL = 'http://localhost:3040/';
const authCookieName = 'roleman-token';

/**
 * Module scoped variables to keep track of admin only and
 * logged in only routes
 */
let pathsRequiringLogin : string[] = [
    '/create',
    '/groups',
    '/admin'
];
let pathsRequiringAdmin : string[] = [
    '/admin'
];

/**
 * Module-scoped variable to keep track of OnAuthChange
 * listeners. The OnAuthChange method will populate this
 * array with event handlers (functions) as they're
 * registered.
 */
let authChangeListeners : Function[] = [];

/**
 * Module-scoped variable to cache basic info about the
 * current session. If this variable is null, there is
 * no session (the user is not logged in). Like all
 * caches, this may get out of sync with reality for
 * any number of reasons.
 */
let sessionInfo = null;

@Injectable()
export class AuthenticationService {

    constructor (private http: Http) {

    }

    /**
     * Method to get an authentication cookie from the backend.
     */
    login(username, password, rememberMe) {
        this.http.post( LdapURL + 'login', { username: username, password: password, rememberMe: rememberMe } )
                .map(res => {
                     sessionInfo = res.json();
                     return sessionInfo;
                })
                .catch(this.handleError);
    }

    /**
     * Delete the user's session
     *
     * This will be done via one of two methods: if we have access
     * to the session cookie directly, we'll just delete it. If we
     * don't have access due to cross-domain issues or the http-only
     * cookie property, we'll send an XHR request to the server
     * asking the server to delete it.
     *
     * Either way, this method will return a promise that will be
     * resolved when the task is complete.
     */
    Logout() {
        sessionInfo = null;

        if( $cookies.get(authCookieName) ) {
            return $q(function(resolve) {
                $cookies.remove( authCookieName );
                this.TriggerOnAuthChange();
                resolve();
            });
        }
        else {
            this.TriggerOnAuthChange();
            return $http.get( LdapURL + 'logout');
        }
    }

    /**
     * @function IsLoggedIn
     * @desc Quick and easy way to check if a session exists\
     * If no sessionInfo is found initially we will check the $cookie cache
     * We will still get the 'authoritative' session info eventually, but this ensures that
     * service lag doesn't cause users to appear that they have been logged out when in reality
     * the authentication service just hasn't returned its http request yet.
     * @requires $cookies
     *
     * @returns {Boolean}
     */
    IsLoggedIn() {
        if( !sessionInfo && $cookies.get(authCookieName) ) {
            sessionInfo = jwt_decode($cookies.get(authCookieName));
        }
        return sessionInfo !== null;
    }

    /**
     * @function IsAdmin
     * @desc Quick and easy way to check if the current logged in user is an admin
     *
     * @returns {Boolean}
     */
    IsAdmin() {
        return sessionInfo !== null && sessionInfo.isAdmin;
    }

    /**
     * @function GetCachedSessionInfo
     * @desc Quick-and-dirty way to get information about the current
     * session. Like all caches, it's fast but it may get out
     * of sync with reality for any number of reasons.
     *
     * For a slower but more accurate way to get session info,
     * see GetAuthoritativeSessionInfo
     *
     * @returns {Object}
     */
    GetCachedSessionInfo() {
        return sessionInfo;
    }

    /**
     * @function GetAuthoritativeSessionInfo
     * @desc Longer (async) but more thorough way to get session information
     * from the server. Will update the variables behind
     * GetCachedSessionInfo so that future calls to that method will
     * also be up to date.
     *
     * @returns {Promise}
     */
    GetAuthoritativeSessionInfo() {
        return $http.get( LdapURL + 'api/v1/editor/sessionInfo').then(
            function (resp) {
                sessionInfo = resp.data;
                this.TriggerOnAuthChange();
                return sessionInfo;
            },
            function () {
                sessionInfo = null;
                this.TriggerOnAuthChange();
                return sessionInfo;
            }
        );
    }

    /**
     * @function isLoginRequired
     * @desc Determines if a user needs to be logged in to view a page
     *
     * @param {String} newPath The path of the page attempting to be accesed
     * @returns {Boolean}
     */
    isLoginRequired( newPath ) {
        return pathsRequiringLogin.some(function (path) {
            return newPath.toLowerCase().indexOf(path) === 0; // newPath.startsWith(path)
        });
    }

    /**
     * @function isAdminRequired
     * @desc Determines if a user needs to be an admin to view a page
     *
     * @param {String} newPath The path of the page attempting to be accesed
     * @returns {Boolean}
     */
    isAdminRequired( newPath ) {
        return pathsRequiringAdmin.some(function (path) {
            return newPath.toLowerCase().indexOf(path) === 0; // newPath.startsWith(path)
        });
    }

    /**
     * @function OnAuthChange
     * @desc Add a listener for the OnAuthChange event.
     *
     * The listener will be called once, immediately,
     * with the current auth status (session info),
     * and again, later, whenever that information changes.
     *
     * @param {Function} listener
     * @returns void
     */
    OnAuthChange(listener) {
        authChangeListeners.push(listener);
        this.TriggerOnAuthChangeListener(listener);
    }

    /**
     * @function TriggerOnAuthChange
     * @desc Private method to automatically notify any relevant
     * listeners about an OnAuthChange event.
     *
     * @returns void
     */
    triggerOnAuthChange() {
        authChangeListeners.forEach(this.TriggerOnAuthChangeListener);
    }

    /**
     * @function TriggerOnAuthChangeListener
     * @desc Private method to automatically notify a single
     * listener about an OnAuthChange event
     *
     * @param {Function} listener
     * @returns void
     */
    TriggerOnAuthChangeListener(listener) {
        listener(sessionInfo);
    }

    private handleError (error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
        const body = error.json() || '';
        const err = body.error || JSON.stringify(body);
        errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
        errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
