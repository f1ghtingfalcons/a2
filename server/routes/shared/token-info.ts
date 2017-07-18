import * as config from './config';
import * as jwt from 'jsonwebtoken';


/**
 * Represents a decrypted user token, such as might be stored in
 * an http cookie.
 *
 * TokenInfo objects can be converted to encrypted JWT strings
 * and back via TokenInfo.encrypt and TokenInfo.decrypt
 */
export class TokenInfo {

    /**
     * Serialize and encrypt a TokenInfo object
     */
    public static encrypt( token: TokenInfo ): string {
        return jwt.sign( token, config.secret );
    }

    /**
     * Decrypt and deserialize a TokenInfo object
     */
    public static decrypt( tokenStr: string ): TokenInfo {
        let decoded;
        try {
            decoded = jwt.verify( tokenStr, config.secret );
        } catch ( error ) {
            throw new Error('Failed to decode token: ' + error );
        }
        return decoded;
    }

    /**
     * Create a new TokenInfo object.
     *
     * 'expires' and 'path' will be set automatically if not specified
     */
    constructor(
        public username: string,
        public isAdmin: boolean,
        public userRegex?: string[],
        public expiresIn?: number
    ) {
        if ( typeof this.expiresIn === 'undefined' ) {
            this.expiresIn = 24 * 60 * 60; // 1 Day in seconds
        }
    }
}
