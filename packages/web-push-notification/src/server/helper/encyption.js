import { Buffer } from 'buffer';
import crypto from "crypto";
import ece from "http_ece";

export const encrypt = async function (
  userPublicKey,
  userAuth,
  payload,
  contentEncoding
) {
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

  let localPublicKey;
  let salt;
  let localPrivateKey;
  let cipherText;

  if (checkEnvironment() === "Node") {
    const localCurve = crypto.createECDH("prime256v1");
    localPrivateKey = localCurve;
    localPublicKey = localCurve.generateKeys();
    salt = crypto.randomBytes(16).toString("base64url");

    console.log("localPublicKey", localPublicKey);
    console.log("salt", salt);
    console.log("localPrivateKey", localPrivateKey);

    cipherText = ece.encrypt(payload, {
      version: contentEncoding,
      dh: userPublicKey,
      privateKey: localPrivateKey,
      salt: salt,
      authSecret: userAuth,
    });
  } else if (checkEnvironment() === "Deno") {
  } else if (checkEnvironment() === "Cloudflare") {
    /** @type {webcrypto} */
    const web_crypto = globalThis.crypto;
    const namedCurve = "P-256";
    const keys = await web_crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: namedCurve,
      },
      true,
      ["deriveKey", "deriveBits"]
    );
    localPrivateKey = keys.privateKey;
    localPublicKey = keys.publicKey;
    let array = new Uint8Array(16);
    web_crypto.getRandomValues(array);
    let salt = btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log(salt);

    // salt = web_crypto.getRandomValues(new Int8Array(16)).toString("base64url");

    console.log("localPublicKey", localPublicKey);
    console.log("salt", salt);
    console.log("localPrivateKey", localPrivateKey);

    cipherText = ece.encrypt(payload, {
      version: contentEncoding,
      dh: userPublicKey,
      // privateKey: localPrivateKey,
      keyid: localPublicKey,
      salt: salt,
      authSecret: userAuth,
    });
  } else {
    throw new Error("Unknown environment");
  }

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

const checkEnvironment = function () {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return "Node";
  } else if (typeof Deno !== "undefined") {
    return "Deno";
  } else if (typeof addEventListener === "function") {
    return "Cloudflare";
  } else {
    return "Unknown";
  }
};
