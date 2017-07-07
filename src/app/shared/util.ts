import { User } from './ldap.model';

// function to sort users based on their name
export function userSort(a: User, b: User) {
    const textA = a.cn.toUpperCase();
    const textB = b.cn.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
}
