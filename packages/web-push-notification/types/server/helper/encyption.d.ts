export function encrypt(userPublicKey: any, userAuth: any, payload: any, contentEncoding: any): Promise<{
    localPublicKey: any;
    salt: any;
    cipherText: any;
}>;
