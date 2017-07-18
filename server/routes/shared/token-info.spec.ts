import { TokenInfo } from './token-info';

describe('Token Service', function() {

    const TOKEN_OBJ = new TokenInfo( 'ltester', false, [], 100 );
    const TOKEN_STR = TokenInfo.encrypt( TOKEN_OBJ );

});
