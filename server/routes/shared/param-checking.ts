import { Response } from 'express';
/** Return an object containing all required params, or false
 *  if one or more params were missing. Parameter paramObj
 *  will typically be either req.body or
 *  url.parse(req.url).query but can technically be an
 *  object with the structure { param:value, ... }
 *  if only one requiredParameterName is submitted a value
 *  rather than an object will be returned.
 */
export function requireParams( paramObj: {}, res: Response, requiredParamNames: string[] ) {
    let returnObj: any = {};
    const missingParams: string[] = [];
    requiredParamNames.forEach(paramName => {
        if ( !paramObj.hasOwnProperty(paramName) ) {
            missingParams.push(paramName);
        } else {
            if ( requiredParamNames.length === 1 ) {
                returnObj = paramObj[paramName];
            } else {
                returnObj[paramName] = paramObj[paramName];
            }
        }
    });

    if ( missingParams.length > 0 ) {
        res.status(400).json({ error: 'The following required parameters were missing: ' + missingParams.join(', ') });
        return undefined;
    }
    return returnObj;
}
