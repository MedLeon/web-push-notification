import wasmWebPush from "wasm-web-push";
import { encrypt } from "./helper/encyption.js";
import pkg from "./helper/vapid-helper.cjs";
const { test_web_push } = wasmWebPush;
const { getVapidHeaders } = pkg;

// Default TTL is four weeks.
const DEFAULT_TTL = 2419200;

var supportedContentEncodings;
(function (supportedContentEncodings) {
  supportedContentEncodings["AES_GCM"] = "aesgcm";
  supportedContentEncodings["AES_128_GCM"] = "aes128gcm";
})(supportedContentEncodings || (supportedContentEncodings = {}));

var supportedUrgency;
(function (supportedUrgency) {
  supportedUrgency["VERY_LOW"] = "very-low";
  supportedUrgency["LOW"] = "low";
  supportedUrgency["NORMAL"] = "normal";
  supportedUrgency["HIGH"] = "high";
})(supportedUrgency || (supportedUrgency = {}));

/**
 * To get the details of a request to trigger a push message, without sending
 * a push notification call this method.
 *
 * This method will throw an error if there is an issue with the input.
 * @param  {IPushSubscription} subscription The PushSubscription you wish to
 * send the notification to.
 * @param  {string} [payload]       The payload you wish to send to the
 * the user.
 * @param  {IOptions} [options]              Options for the GCM API key and
 * vapid keys can be passed in if they are unique for each notification you
 * wish to send.
 * @return {RequestDetails}                       This method returns an Object which
 * contains 'endpoint', 'method', 'headers' and 'payload'.
 */
const generateRequestDetails = async function (
  subscription,
  payload, // #TODO change to Buffer?? Or more complex type?
  vapidDetails,
  options
) {
  if (!subscription || !subscription.endpoint) {
    throw new Error(
      "You must pass in a subscription with at least " + "an endpoint."
    );
  }
  if (
    typeof subscription.endpoint !== "string" ||
    subscription.endpoint.length === 0
  ) {
    throw new Error(
      "The subscription endpoint must be a string with " + "a valid URL."
    );
  }
  if (payload) {
    // Validate the subscription keys
    if (
      typeof subscription !== "object" ||
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {
      throw new Error(
        "To send a message with a payload, the " +
          "subscription must have 'auth' and 'p256dh' keys."
      );
    }
  }
  let currentVapidDetails = vapidDetails;
  let timeToLive = DEFAULT_TTL;
  let contentEncoding = supportedContentEncodings.AES_128_GCM;
  let urgency = supportedUrgency.NORMAL;
  let topic;
  if (options) {
    const validOptionKeys = [
      "headers",
      "gcmAPIKey",
      "vapidDetails",
      "TTL",
      "contentEncoding",
      "urgency",
      "topic",
      "proxy",
      "agent",
      "timeout",
    ];
    const optionKeys = Object.keys(options);
    for (let i = 0; i < optionKeys.length; i += 1) {
      const optionKey = optionKeys[i];
      if (!validOptionKeys.includes(optionKey)) {
        throw new Error(
          "'" +
            optionKey +
            "' is an invalid option. " +
            "The valid options are ['" +
            validOptionKeys.join("', '") +
            "']."
        );
      }
    }
    if (options.TTL !== undefined) {
      timeToLive = Number(options.TTL);
      if (timeToLive < 0) {
        throw new Error("TTL should be a number and should be at least 0");
      }
    }
    if (options.contentEncoding) {
      if (
        options.contentEncoding === supportedContentEncodings.AES_128_GCM ||
        options.contentEncoding === supportedContentEncodings.AES_GCM
      ) {
        contentEncoding = options.contentEncoding;
      } else {
        throw new Error("Unsupported content encoding specified.");
      }
    }
    if (options.urgency) {
      if (
        options.urgency === supportedUrgency.VERY_LOW ||
        options.urgency === supportedUrgency.LOW ||
        options.urgency === supportedUrgency.NORMAL ||
        options.urgency === supportedUrgency.HIGH
      ) {
        urgency = options.urgency;
      } else {
        throw new Error("Unsupported urgency specified.");
      }
    }
    if (options.topic) {
      if (!/^[A-Za-z0-9\-_]+$/.test(options.topic)) {
        throw new Error(
          "Unsupported characters set use the URL or filename-safe Base64 characters set"
        );
      }
      if (options.topic.length > 32) {
        throw new Error(
          "use maximum of 32 characters from the URL or filename-safe Base64 characters set"
        );
      }
      topic = options.topic;
    }
  }
  if (typeof timeToLive === "undefined") {
    timeToLive = DEFAULT_TTL;
  }
  const requestDetails = {
    method: "POST",
    headers: {
      TTL: timeToLive,
    },
    endpoint: subscription.endpoint,
  };
  //TODO necessary?
  //   Object.keys(extraHeaders).forEach(function (header) {
  //     requestDetails.headers[header] = extraHeaders[header];
  //   });
  let requestPayload = null;
  if (payload) {
    const encrypted = await encrypt(
      subscription.keys.p256dh,
      subscription.keys.auth,
      payload,
      contentEncoding
    );
    requestDetails.headers = {
      ...requestDetails.headers,
      ...{
        // "Content-Length": encrypted.cipherText.length,
        "Content-Type": "application/octet-stream",
      },
    };
    if (contentEncoding === supportedContentEncodings.AES_128_GCM) {
      requestDetails.headers = {
        ...requestDetails.headers,
        ...{ "Content-Encoding": supportedContentEncodings.AES_128_GCM },
      };
    } else if (contentEncoding === supportedContentEncodings.AES_GCM) {
      requestDetails.headers = {
        ...requestDetails.headers,
        ...{
          "Content-Encoding": supportedContentEncodings.AES_GCM,
          Encryption: "salt=" + encrypted.salt,
          "Crypto-Key": "dh=" + encrypted.localPublicKey.toString("base64url"),
        },
      };
    }
    requestDetails.body = encrypted.cipherText;
  } else {
    //TODO necessary?
    // requestDetails.headers = {
    //     ...requestDetails.headers,
    //     ...{ "Content-Length": 0 },
    //   };
  }
  const isFCM = subscription.endpoint.startsWith(
    "https://fcm.googleapis.com/fcm/send"
  );
  // VAPID isn't supported by GCM hence the if, else if.
  const parsedUrl = new URL(subscription.endpoint);
  const audience = parsedUrl.protocol + "//" + parsedUrl.host;
  const vapidHeaders = getVapidHeaders(
    audience,
    currentVapidDetails.subject,
    currentVapidDetails.publicKey,
    currentVapidDetails.privateKey,
    contentEncoding
  );
  requestDetails.headers.Authorization = vapidHeaders.Authorization;
  if (contentEncoding === supportedContentEncodings.AES_GCM) {
    if (requestDetails.headers["Crypto-Key"]) {
      requestDetails.headers["Crypto-Key"] += ";" + vapidHeaders["Crypto-Key"];
    } else {
      requestDetails.headers["Crypto-Key"] = vapidHeaders["Crypto-Key"]; //TODO REMOVE !
    }
  }
  requestDetails.headers.Urgency = urgency;
  if (topic) {
    requestDetails.headers.Topic = topic;
  }
  return requestDetails;
};
export const sendNotification = async function (
  notification,
  subscription,
  vapidDetails,
  options
) {
  console.log("sendNotification");
  console.log(add(1, 2));

  // #TODO Add validation of input
  /*
        vapidHelper.validateSubject(subject);
        vapidHelper.validatePublicKey(publicKey);
        vapidHelper.validatePrivateKey(privateKey);
      */
  let requestDetails = await generateRequestDetails(
    subscription,
    notification,
    vapidDetails,
    options
  );
  console.log(requestDetails);
  const requestOptions = {
    method: requestDetails.method,
    headers: requestDetails.headers,
    body: requestDetails.body,
  };
  try {
    const response = await fetch(requestDetails.endpoint, requestOptions);
    if (!response.ok) {
      throw new WebPushError(
        "Received unexpected response code",
        response.status,
        response.headers,
        response.statusText,
        requestDetails.endpoint
      );
    }
    // console.log(response)
    const responseBody = await response.text();
    console.log(responseBody);
    return {
      statusCode: response.status,
      body: responseBody,
      headers: response.headers,
    };
  } catch (err) {
    throw err;
  }
};

/** @typedef {Object} VapidDetails
 * @property {string} subject
 * @property {string} publicKey
 * @property {string} privateKey
 */
/** @typedef {Object} RequestDetails
 * @property {string} method
 * @property {{[key:string]:string|number;}} headers
 * @property {any} payload
 * @property {string} endpoint
 */
/** @typedef {Object} IVapidDetails
 * @property {string} subject
 * @property {string} publicKey
 * @property {string} privateKey
 */
/** @typedef {Object} IHeaders */
/** @typedef {Object} IOptions
 * @property {string} gcmAPIKey
 * @property {IVapidDetails} vapidDetails
 * @property {number} timeout
 * @property {number} TTL
 * @property {IHeaders} headers
 * @property {string} contentEncoding
 * @property {string} urgency
 * @property {string} topic
 * @property {string} proxy
 * @property {string} agent
 */
/** @typedef {Object} IKeys
 * @property {string} p256dh
 * @property {string} auth
 */
/** @typedef {Object} IPushSubscription
 * @property {string} endpoint
 * @property {null|number} expirationTime
 * @property {IKeys} keys
 */
