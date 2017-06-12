import { Component, OnInit } from '@angular/core';
import { UsersService } from '../shared/users.service';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    users: {}[];
    errorMessage: string;

    constructor( private usersService: UsersService ) {}

    ngOnInit() {
        this.getUsers();
    }

    getUsers() {
        this.usersService.getAllUsers().subscribe(
            users => {
                console.log(users);
                this.users = users },
            error => this.errorMessage = <any>error
        );
    }
}
