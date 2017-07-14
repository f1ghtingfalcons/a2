import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { handleError } from './util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { UsersService } from './users.service';

const LdapURL = 'http://localhost:3040/';

export interface LoginForm {
    username: string;
    password: string;
    rememberMe?: boolean;
}

@Injectable()
export class AuthService {
    // Create a stream of logged in status to communicate throughout app
    loggedIn: boolean;
    loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
    loggedInUser: string;
    loggedInUser$ = new BehaviorSubject<string>(this.loggedInUser);
    loggedInAdmin: boolean;
    loggedInAdmin$ = new BehaviorSubject<boolean>(this.loggedInAdmin);
    jwt: JwtHelper = new JwtHelper();

    constructor(private router: Router, private http: Http, private usersService: UsersService ) {
        // If authenticated, set local profile property and update login status subject
        if (this.authenticated) {
            this.setLoggedIn(true);
        }
    }

    setLoggedIn(value: boolean) {
        // Update login status subject
        if ( value ) {
            const token = this.jwt.decodeToken( localStorage.getItem('token') );
            this.loggedInUser$.next(token.username);
            this.loggedInUser = token.username;
            this.loggedInAdmin$.next(token.isAdmin);
            this.loggedInAdmin = token.isAdmin;
        }
        this.loggedIn$.next(value);
        this.loggedIn = value;
    }

    login( loginRequest: LoginForm ) {
        return this.http.post( LdapURL + 'login', loginRequest )
                   .map( res => {
                       const accessToken = res.json();
                       this._setSession( accessToken );
                       return res.json();
                    })
                   .catch(handleError);
    }

    private _setSession( accessToken ) {
        // Save session data and update login status subject
        localStorage.setItem('token', accessToken);
        this.setLoggedIn(true);
    }

    logout() {
        // Remove tokens and profile and update login status subject
        localStorage.removeItem('token');
        this.router.navigate(['/']);
        this.setLoggedIn(false);
    }

    get authenticated() {
        // Check if there's an unexpired access token
        return tokenNotExpired('token');
    }
}
