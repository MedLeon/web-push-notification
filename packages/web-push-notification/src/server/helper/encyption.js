import crypto from "crypto";
import ece from "http_ece";

export const encrypt =  function (userPublicKey, userAuth, payload, contentEncoding) {
  if (!userPublicKey) {
    throw new Error("No user public key provided for encryption.");
  }

  if (typeof userPublicKey !== "string") {
    throw new Error("The subscription p256dh value must be a string.");
  }

  // if (Buffer.from(userPublicKey, "base64url").length !== 65) {
  //   throw new Error("The subscription p256dh value should be 65 bytes long.");
  // }

  if (!userAuth) {
    throw new Error("No user auth provided for encryption.");
  }

  if (typeof userAuth !== "string") {
    throw new Error("The subscription auth key must be a string.");
  }

  // if (Buffer.from(userAuth, "base64url").length < 16) {
  //   throw new Error(
  //     "The subscription auth key should be at least 16 " + "bytes long"
  //   );
  // }

  if (typeof payload !== "string" && !Buffer.isBuffer(payload)) {
    throw new Error("Payload must be either a string or a Node Buffer.");
  }

  if (typeof payload === "string" || payload instanceof String) {
    payload = Buffer.from(payload);
  }

  
  const localCurve = crypto.createECDH("prime256v1");
  // const localCurve = await generateECDHKeyPair();

  const localPublicKey = localCurve.generateKeys();

  const salt = crypto.randomBytes(16).toString("base64url");

  const cipherText = ece.encrypt(payload, {
    version: contentEncoding,
    dh: userPublicKey,
    privateKey: localCurve,
    salt: salt,
    authSecret: userAuth,
  });

  return {
    localPublicKey: localPublicKey,
    salt: salt,
    cipherText: cipherText,
  };
};




// async function generateECDHKeyPair() {
//   const namedCurve = 'P-256'; // Equivalent to prime256v1
//   const keyPair = await crypto.subtle.generateKey(
//       {
//           name: 'ECDH',
//           namedCurve: namedCurve
//       },
//       true, // whether the key is extractable
//       ['deriveKey', 'deriveBits'] // can be any subset of ['deriveKey', 'deriveBits']
//   );
//   return keyPair;
// }