import { encrypt } from "./helper/encyption.js";
import { getVapidHeaders } from "./helper/vapid.js";

// Default TTL is four weeks.
const DEFAULT_TTL = 2419200;

enum supportedContentEncodings {
  AES_GCM = "aesgcm",
  AES_128_GCM = "aes128gcm",
}

enum supportedUrgency {
  VERY_LOW = "very-low",
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
}

interface VapidDetails {
  subject: string;
  publicKey: string;
  privateKey: string;
}

interface RequestDetails {
  method: string;
  headers: {
    [key: string]: string | number;
  };
  payload: any;
  endpoint: string;
}

export interface IVapidDetails {
  subject: string;
  publicKey: string;
  privateKey: string;
}

export interface IHeaders {
  [key: string]: string;
}

export interface IOptions {
  gcmAPIKey: string;
  vapidDetails: IVapidDetails;
  timeout: number;
  TTL: number;
  headers: IHeaders;
  contentEncoding: string;
  urgency: string;
  topic: string;
  proxy: string;
  agent: string; // assuming agent is a string
}

export interface IKeys {
  p256dh: string;
  auth: string;
}

export interface IPushSubscription {
  endpoint: string;
  expirationTime: null | number; // number is assumed if it's not always null
  keys: IKeys;
}

/**
 * To get the details of a request to trigger a push message, without sending
 * a push notification call this method.
 *
 * This method will throw an error if there is an issue with the input.
 * @param  {PushSubscription} subscription The PushSubscription you wish to
 * send the notification to.
 * @param  {string|Buffer} [payload]       The payload you wish to send to the
 * the user.
 * @param  {Object} [options]              Options for the GCM API key and
 * vapid keys can be passed in if they are unique for each notification you
 * wish to send.
 * @return {Object}                       This method returns an Object which
 * contains 'endpoint', 'method', 'headers' and 'payload'.
 */
const generateRequestDetails = function (
  subscription: IPushSubscription,
  payload: string, // #TODO change to Buffer?? Or more complex type?
  vapidDetails: VapidDetails,
  options?: IOptions
): RequestDetails {
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

  const requestDetails: RequestDetails = {
    method: "POST",
    headers: {},
    endpoint: subscription.endpoint,
    payload: payload,
  };
  //TODO necessary?
  //   Object.keys(extraHeaders).forEach(function (header) {
  //     requestDetails.headers[header] = extraHeaders[header];
  //   });
  let requestPayload = null;

  if (payload) {
    const encrypted = encrypt(
      subscription.keys.p256dh,
      subscription.keys.auth,
      payload,
      contentEncoding
    );

    requestDetails.headers = {
      ...requestDetails.headers,
      ...{
        "Content-Length": encrypted.cipherText.length,
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

    requestPayload = encrypted.cipherText;
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
      requestDetails.headers["Crypto-Key"] = vapidHeaders["Crypto-Key"]!; //TODO REMOVE !
    }
  }

  requestDetails.headers.Urgency = urgency;

  if (topic) {
    requestDetails.headers.Topic = topic;
  }

  return requestDetails;
};

/**
 * To send a push notification call this method with a subscription, optional
 * payload and any options.
 * @param  {PushSubscription} subscription The PushSubscription you wish to
 * send the notification to.
 * @param  {string|Buffer} [payload]       The payload you wish to send to the
 * the user.
 * @param  {Object} [options]              Options for the GCM API key and
 * vapid keys can be passed in if they are unique for each notification you
 * wish to send.
 * @return {Promise}                       This method returns a Promise which
 * resolves if the sending of the notification was successful, otherwise it
 * rejects.
 */
// DELTETE: export const sendNotification = function (subscription, payload, options) {
// export const sendNotification = function (
//   notification: string,
//   subscription: PushSubscription,
//   vapidDetails: VapidDetails
// ): Promise<any> {
//   // #TODO Add validation of input
//   /*
//         vapidHelper.validateSubject(subject);
//     vapidHelper.validatePublicKey(publicKey);
//     vapidHelper.validatePrivateKey(privateKey);
//     */
//     // subscription: IPushSubscription,
//     // payload: string, // #TODO change to Buffer?? Or more complex type?
//     // options: IOptions,
//     // vapidDetails: VapidDetails
//   let requestDetails;
//   try {
//     requestDetails = generateRequestDetails(subscription, payload, options);
//   } catch (err) {
//     return Promise.reject(err);
//   }

//   return new Promise(function (resolve, reject) {
//     const httpsOptions = {};
//     const urlParts = url.parse(requestDetails.endpoint);
//     httpsOptions.hostname = urlParts.hostname;
//     httpsOptions.port = urlParts.port;
//     httpsOptions.path = urlParts.path;

//     httpsOptions.headers = requestDetails.headers;
//     httpsOptions.method = requestDetails.method;

//     if (requestDetails.timeout) {
//       httpsOptions.timeout = requestDetails.timeout;
//     }

//     if (requestDetails.agent) {
//       httpsOptions.agent = requestDetails.agent;
//     }

//     if (requestDetails.proxy) {
//       const HttpsProxyAgent = require("https-proxy-agent"); // eslint-disable-line global-require
//       httpsOptions.agent = new HttpsProxyAgent(requestDetails.proxy);
//     }

//     const pushRequest = https.request(httpsOptions, function (pushResponse) {
//       let responseText = "";

//       pushResponse.on("data", function (chunk) {
//         responseText += chunk;
//       });

//       pushResponse.on("end", function () {
//         if (pushResponse.statusCode < 200 || pushResponse.statusCode > 299) {
//           reject(
//             new WebPushError(
//               "Received unexpected response code",
//               pushResponse.statusCode,
//               pushResponse.headers,
//               responseText,
//               requestDetails.endpoint
//             )
//           );
//         } else {
//           resolve({
//             statusCode: pushResponse.statusCode,
//             body: responseText,
//             headers: pushResponse.headers,
//           });
//         }
//       });
//     });

//     if (requestDetails.timeout) {
//       pushRequest.on("timeout", function () {
//         pushRequest.destroy(new Error("Socket timeout"));
//       });
//     }

//     pushRequest.on("error", function (e) {
//       reject(e);
//     });

//     if (requestDetails.body) {
//       pushRequest.write(requestDetails.body);
//     }

//     pushRequest.end();
//   });
// };
export const sendNotification = async function (
  notification: string,
  subscription: IPushSubscription,
  vapidDetails: VapidDetails,
  options?: IOptions
): Promise<any> {
  // #TODO Add validation of input
  /* 
      vapidHelper.validateSubject(subject);
      vapidHelper.validatePublicKey(publicKey);
      vapidHelper.validatePrivateKey(privateKey); 
    */

  let requestDetails = generateRequestDetails(
    subscription,
    notification,
    vapidDetails,
    options
  );

  const requestOptions = {
    method: requestDetails.method,
    headers: requestDetails.headers,
    body: requestDetails.payload,
  };

  try {
    const response = await fetch(
      requestDetails.endpoint,
      requestOptions as any
    );

    //   if (!response.ok) {
    //     throw new WebPushError(
    //       "Received unexpected response code",
    //       response.status,
    //       response.headers,
    //       response.statusText,
    //       requestDetails.endpoint
    //     );
    //   }

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      body: responseBody,
      headers: response.headers,
    };
  } catch (err) {
    throw err;
  }
};
