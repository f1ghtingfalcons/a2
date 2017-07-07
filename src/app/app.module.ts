import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule, JsonpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { NavigationComponent, LoginDialogComponent } from './navigation/navigation.component';
import * as httpService from './http-services/index';
import * as shared from './shared/index';

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent,
        NavigationComponent,
        LoginDialogComponent,
        shared.SearchBoxComponent,
        shared.AutocompleteComponent,
        shared.SearchUsersPipe
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
        httpService.GroupsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
