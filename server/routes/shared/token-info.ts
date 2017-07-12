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
        const decoded = jwt.verify( tokenStr, config.secret );

        const getOrThrow = key => {
            if ( decoded.hasOwnProperty(key) ) {
                return decoded[key];
            } else {
                throw new Error('Failed to decode token');
            }
        };

        return new TokenInfo(
            getOrThrow('username'),
            Boolean(getOrThrow('isAdmin')),
            decoded['userRegex'],
            Number(getOrThrow('expires'))
        );
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
        public exp?: number
    ) {
        if ( typeof this.exp === 'undefined' ) {
            const dateObj = new Date();
            this.exp = dateObj.setDate( dateObj.getDate() + config.tokenLifetimeDays );
        }
    }
}
