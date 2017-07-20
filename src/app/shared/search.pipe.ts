import { Pipe, PipeTransform } from '@angular/core';
import { User, Group } from './ldap.model';

@Pipe({name: 'SearchUsers', pure: false})
export class SearchUsersPipe implements PipeTransform {
    transform( haystack: User[], input ) {
        const returnList = [];
        if ( !input ) {
            return haystack;
        }
        // split up our search string into a list of the words
        const needleWordList = input.split( ' ' );
        // boolean variable
        let allWordMatch = true;
        // variable to keep a concatenated version of each row to search
        // through
        let allFieldsString;
        // join only the searchable values of each row into a single string
        // that we can search
        haystack.forEach( hay => {
            allWordMatch = true;
            allFieldsString = hay.cn + ' ' + hay.memberOf + ' ' + hay.mail + ' ' + hay.uid;
            needleWordList.forEach( needle => {
                if ( allFieldsString.toUpperCase().indexOf( needle.toUpperCase() ) === -1 ) {
                    allWordMatch = false;
                }
            })
            if ( allWordMatch ) {
                returnList.push( hay );
            }
        });
        return returnList;
    };
}

@Pipe({name: 'SearchGroups'})
export class SearchGroupsPipe implements PipeTransform {
    transform( haystack: Group[], input ) {
        const returnList = [];
        if ( !input ) {
            return haystack;
        }
        if ( !haystack ) {
            return [];
        }
        return haystack.filter( hay => hay.cn.toUpperCase().indexOf( input.toUpperCase() ) > -1 );
    };
}

@Pipe({name: 'SearchText'})
export class SearchTextPipe implements PipeTransform {
    transform( haystack: string[], input ) {
        const returnList = [];
        if ( !input ) {
            return haystack;
        }
        if ( !haystack ) {
            return [];
        }
        return haystack.filter( hay => hay.toUpperCase().indexOf( input.toUpperCase() ) > -1 );
    };
}
