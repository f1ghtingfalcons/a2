import { Pipe, PipeTransform } from '@angular/core';
import { User } from './ldap.model';

@Pipe({name: 'SearchUsers'})
export class SearchUsersPipe implements PipeTransform {
    transform( users: User[], input ) {
        if ( !input ) {
            return users;
        }
        // variable to keep a concatenated version of each row to search through
        let allFieldsString;
        input = input.toUpperCase();
        return users.filter( user => {
            // join only the searchable values of each row into a single string that we can search
            allFieldsString = user.cn + ' ' + user.memberOf + ' ' + user.mail + ' ' + user.uid;
            return allFieldsString.toUpperCase().indexOf( input ) > -1;
        });
    };
}
