import 'hammerjs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpModule, JsonpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { NavigationComponent, LoginDialogComponent } from './navigation/navigation.component';
import { UsersService } from './shared/users.service';

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent,
        NavigationComponent,
        LoginDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialModule,
        FlexLayoutModule,
        HttpModule,
        JsonpModule
    ],
    entryComponents: [
        LoginDialogComponent
    ],
    providers: [
        UsersService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
