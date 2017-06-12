import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Page, PagePermissions } from './page';
import { MdDialog, MdDialogRef } from '@angular/material';

const freeAccess : PagePermissions = new PagePermissions( false, false );
const adminOnly : PagePermissions = new PagePermissions( true, true );
const loggedInAccess : PagePermissions = new PagePermissions( true, false );

@Component({
    selector: 'nav-bar',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})

/** Dynamic Navigation Bar Component */
export class NavigationComponent {
    router : Router;
    menuOpen : boolean = false;
    username : string;
    isLoggedIn : boolean = false;
    isAdmin : boolean = false;
    pages : Page[] = [
        new Page( 'Users', 'users', freeAccess ),
        new Page( 'Groups', 'groups', loggedInAccess ),
        new Page( 'Create', 'create', adminOnly ),
        new Page( 'Tools', 'tools', freeAccess ),
        new Page( 'About', 'about', freeAccess )
    ];


    constructor( private _router : Router, public loginDialog : MdDialog ) {
        this.router = _router;
    }

    /**
     * Returns whether or not a link points to the current page
     */
    isActive( page: Page ) : boolean {
        if ( '/' + page.url === this.router.url ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Display the login dialog box
     */
    showLogin() {
        this.loginDialog.open(LoginDialogComponent);
    }

    /**
     * Request logout from the backend and delete auth cookies
     */
    logout() {
        // Note: this will update $scope.isLoggedIn via the OnAuthChange event
        //AuthenticationService.Logout();
    }

    /**
     * toggles the extra site pages menu (next to the user name)
     */
    openMenu() {
        this.menuOpen = !this.menuOpen;
    }

    /**
     * Determines whether the logged in user has permission
     * to access a link
     */
    routeIsAvailable( page: Page ) {
        if ( page.permissions.needsAdmin ) {
            return this.isAdmin;
        }
        if ( page.permissions.needsLogin ) {
            return this.username;
        }
        return true;
    }
}

@Component({
  selector: 'login-dialog',
  templateUrl: 'login-dialog.html',
})
export class LoginDialogComponent {
  constructor(public dialogRef: MdDialogRef<LoginDialogComponent>) {}
}
