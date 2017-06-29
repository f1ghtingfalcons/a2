import { Component, OnInit } from '@angular/core';
import { UsersService } from '../shared/users.service';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    p: number = 1;
    users: {}[] = [];
    errorMessage: string;
    loadingUsers = true;

    constructor( private usersService: UsersService ) {}

    ngOnInit() {
        this.getUsers();
    }

    getUsers() {
        this.usersService.getAllUsers().subscribe(
            users => {
                this.users = users.sort(function(a, b) {
                    var textA = a.cn.toUpperCase();
                    var textB = b.cn.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
            },
            error => this.errorMessage = <any>error,
            () => this.loadingUsers = false
        );
    }
}
