import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { NavigationComponent, LoginDialogComponent } from './navigation/navigation.component';
import * as httpService from './http-services/index';
import * as shared from './shared/index';

/** Setup Basic Authentication for our app */
export function authHttpServiceFactory(http: Http, options: RequestOptions) {
    return new AuthHttp(new AuthConfig(
    {
        tokenName: 'token',
        tokenGetter: (() => sessionStorage.getItem('token')),
        globalHeaders: [{'Content-Type': 'application/json'}],
    }), http, options);
}

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent,
        NavigationComponent,
        LoginDialogComponent,
        shared.SearchBoxComponent,
        shared.AutocompleteComponent,
        shared.SearchUsersPipe,
        shared.ActivityLogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialModule,
        FlexLayoutModule,
        HttpModule,
        JsonpModule,
        NgxPaginationModule,
        FormsModule
    ],
    entryComponents: [
        LoginDialogComponent
    ],
    providers: [
        httpService.UsersService,
        httpService.GroupsService,
        httpService.AuthService,
        shared.ActivityLogService,
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
