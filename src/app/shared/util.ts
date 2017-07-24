import { User, Group } from './ldap.model';
import {Directive, HostListener} from '@angular/core';

/** function to sort users based on their name */
export function ldapSort(a: any, b: any) {
    const textA = a.cn.toUpperCase();
    const textB = b.cn.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
}

/** Useful Directive that allows us to contain clicks within an element */
@Directive({
    selector: '[appStopClick]'
})
export class ClickStopDirective {
    @HostListener('click', ['$event'])
    public onClick(event: any): void {
        event.stopPropagation();
    }
}
