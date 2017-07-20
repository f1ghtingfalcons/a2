import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { CreateComponent } from './create/create.component';
import { AboutComponent } from './about/about.component';
import { GroupsComponent } from './groups/groups.component';
import { AdminComponent } from './admin/admin.component';
import { ToolsComponent } from './tools/tools.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
    { path: '', redirectTo: '/users', pathMatch: 'full' },
    { path: 'users',  component: UsersComponent },
    { path: 'groups',  component: GroupsComponent },
    { path: 'tools',  component: ToolsComponent },
    { path: 'about',  component: AboutComponent },
    { path: 'admin',  component: AdminComponent },
    { path: 'create',  component: CreateComponent },
    { path: 'profile/:uid', component: ProfileComponent }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
