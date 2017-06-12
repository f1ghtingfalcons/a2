import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { MaterialModule }   from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';
import { UsersComponent }   from './users/users.component';

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MaterialModule,
        FlexLayoutModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
