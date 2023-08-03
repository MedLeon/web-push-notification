/**
 * Given the number of seconds calculates
 * the expiration in the future by adding the passed `numSeconds`
 * with the current seconds from Unix Epoch
 *
 * @param {Number} numSeconds Number of seconds to be added
 * @return {Number} Future expiration in seconds
 */
export function getFutureExpirationTimestamp(numSeconds: number): number;
/**
 * This method takes the required VAPID parameters and returns the required
 * header to be added to a Web Push Protocol Request.
 * @param  {string} audience        This must be the origin of the push service.
 * @param  {string} subject         This should be a URL or a 'mailto:' email
 * address.
 * @param  {string} publicKey       The VAPID public key.
 * @param  {string} privateKey      The VAPID private key.
 * @param  {string} contentEncoding The contentEncoding type.
 * @param  {integer} [expiration]   The expiration of the VAPID JWT.
 * @return {Object}                 Returns an Object with the Authorization and
 * 'Crypto-Key' values to be used as headers.
 */
export function getVapidHeaders(audience: string, subject: string, publicKey: string, privateKey: string, contentEncoding: string, expiration?: integer): any;
export function validateSubject(subject: any): void;
export function validatePublicKey(publicKey: any): void;
export function validatePrivateKey(privateKey: any): void;
/**
 * Validates the Expiration Header based on the VAPID Spec
 * Throws error of type `Error` if the expiration is not validated
 *
 * @param {Number} expiration Expiration seconds from Epoch to be validated
 */
export function validateExpiration(expiration: number): void;
