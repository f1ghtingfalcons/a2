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
import { CreateComponent } from './create/create.component'
import { AboutComponent } from './about/about.component';
import { GroupsComponent } from './groups/groups.component';
import { ToolsComponent, ToolListDialogComponent } from './tools/tools.component';
import { ProfileComponent } from './profile/profile.component';
import { NavigationComponent, LoginDialogComponent } from './navigation/navigation.component';
import * as adminPage from './admin/index';
import * as httpService from './http-services/index';
import * as shared from './shared/index';

/** Setup Basic Authentication for our app */
export function authHttpServiceFactory(http: Http, options: RequestOptions) {
    return new AuthHttp(new AuthConfig(), http, options);
}

@NgModule({
    declarations: [
        AppComponent,
        shared.ActivityLogComponent,
        shared.AutocompleteComponent,
        UsersComponent,
        CreateComponent,
        AboutComponent,
        GroupsComponent,
        ToolsComponent,
        ToolListDialogComponent,
        ProfileComponent,
        adminPage.AdminComponent,
        adminPage.AdminsControlComponent,
        adminPage.LogComponent,
        adminPage.EmailEditComponent,
        adminPage.ProtectedGroupsComponent,
        adminPage.ProjectListComponent,
        adminPage.DeleteUserComponent,
        NavigationComponent,
        LoginDialogComponent,
        shared.SearchBoxComponent,
        shared.SearchUsersPipe,
        shared.SearchGroupsPipe,
        shared.SearchTextPipe,
        shared.ClickStopDirective
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
        ReactiveFormsModule,
        FormsModule
    ],
    entryComponents: [
        LoginDialogComponent
    ],
    providers: [
        shared.ActivityLogService,
        httpService.UsersService,
        httpService.GroupsService,
        httpService.AuthService,
        httpService.LogService,
        httpService.AdminService,
        httpService.ProtectedGroupsService,
        httpService.EmailService,
        httpService.ProjectService,
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
