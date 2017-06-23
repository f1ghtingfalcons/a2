import { TokenInfo } from './token-info';

describe('Token Service', function() {

    const TOKEN_STR = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Imx0ZXN0ZXIiLCJpc0FkbWlu
    IjpmYWxzZSwidXNlclJlZ2V4IjpbXSwicGF0aCI6Ii8iLCJleHBpcmVzIjoxMDB9.O6Zm2Vg5BrLUod37ncp6ho9qaS0s4J4um5uo6Q8v2-U`;

    const TOKEN_OBJ = new TokenInfo(
        'ltester',
        false,
        [],
        '/',
        100
    );

    it('can encrypt a token', function() {
        const tokenStr: string = TokenInfo.encrypt( TOKEN_OBJ );
        expect( tokenStr ).toBe( TOKEN_STR );
    });

    it('can decrypt a token', function() {
        const token = TokenInfo.decrypt( TOKEN_STR );

        expect( token ).toEqual( TOKEN_OBJ );
    });
});
