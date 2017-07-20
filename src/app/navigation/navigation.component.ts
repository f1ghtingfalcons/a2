import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Page, PagePermissions } from './page';
import { MdDialog, MdDialogRef } from '@angular/material';
import { AuthService } from '../http-services/auth.service';
import { NgForm } from '@angular/forms';

const freeAccess: PagePermissions = new PagePermissions( false, false );
const adminOnly: PagePermissions = new PagePermissions( true, true );
const loggedInAccess: PagePermissions = new PagePermissions( true, false );

@Component({
    selector: 'app-nav-bar',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})

/** Dynamic Navigation Bar Component */
export class NavigationComponent {
    menuOpen = false;
    pages: Page[] = [
        new Page( 'Users', 'users', freeAccess ),
        new Page( 'Groups', 'groups', loggedInAccess ),
        new Page( 'Create', 'create', adminOnly ),
        new Page( 'Tools', 'tools', freeAccess ),
        new Page( 'About', 'about', freeAccess )
    ];


    constructor( private router: Router, public loginDialog: MdDialog, private auth: AuthService ) {}

    /**
     * Returns whether or not a link points to the current page
     */
    isActive( page: Page ): boolean {
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
     * Delete the token and reset logged in variables
     */
    logout() {
        this.auth.logout();
    }

    /**
     * toggles the extra site pages menu (next to the user name)
     */
    openMenu() {
        this.menuOpen = !this.menuOpen;
    }

    gotoProfilePage() {
        if ( this.auth.loggedInUser ) {
            this.router.navigateByUrl('profile/' + this.auth.loggedInUser);
        }
    }

    gotoAdminPage() {
        this.router.navigate(['/admin']);
    }
}

@Component({
    selector: 'app-login-dialog',
    templateUrl: 'login-dialog.html'
})
export class LoginDialogComponent {
    loggingIn = false;
    loginError: string;

    constructor(public dialogRef: MdDialogRef<LoginDialogComponent>, private auth: AuthService ) {}

    login( f: NgForm ) {
        this.loggingIn = true;
        this.auth.login( f.value ).subscribe(
            () => this.loggingIn = false,
            error => {
                this.loginError = error
                this.loggingIn = false;
            },
            () => this.dialogRef.close()
        );
    }
}
