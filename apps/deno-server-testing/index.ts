import { sendNotification } from "../../packages/web-push-notification/src/server/index.js";

// get subscription from somewhere. Most likely a DB like Postgres.
const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/fy2hK-ceglQ:APA91bFsj9NNwriJv6X63RvPfCSrToogNFkycIuk9r1xkCZgZTyJgxm4zGqqzPFYprJiJks3YSRxVu9QD0gUDHMjoil3XTEOpR7xQ-wSZ7u27A5H3w178vN2F_UwH8yIuyOo8igQNIs1",
  expirationTime: null,
  keys: {
    p256dh:
      "BOeZPXXropUz0ZAxqCsRFWpDp4VeV4tZiwBiCUOflabc7ggKVrlNcJ7awKHtU8o8WsTodc9afmLDhLQS-yAQHFI",
    auth: "bi4XGrVWr0sTM1m_2FGJsA",
  },
};

// create notification information
const notification = {
  text: "....",
};

// your Vapid Details from Step 1
const vapidDetails = {
  subject: "mailto:example@yourdomain.com",
  publicKey:
    "BC5koZoTOHO9_M818EO3AgJDSMM16GoecgTAKeBk4dAH0q8X2Kao8hh5o0ycK2_t3vu3cBWm-p2f6fUX_BIhb-E",
  privateKey: "s3R9JPNveMo6SMY5BQn23jJNlUwKeinGYE1EM2Rw2WQ",
};

sendNotification(notification.text, pushSubscription, vapidDetails);

// const webpush = require("web-push");

// // webpush.setGCMAPIKey('<Your GCM API Key Here>');
// webpush.setVapidDetails(
//   "mailto:example@yourdomain.org",
//   "BC5koZoTOHO9_M818EO3AgJDSMM16GoecgTAKeBk4dAH0q8X2Kao8hh5o0ycK2_t3vu3cBWm-p2f6fUX_BIhb-E",
//   "s3R9JPNveMo6SMY5BQn23jJNlUwKeinGYE1EM2Rw2WQ"
// );

// // This is the same output of calling JSON.stringify on a PushSubscription
// const pushSubscription = {
//   endpoint:
//     "https://fcm.googleapis.com/fcm/send/fy2hK-ceglQ:APA91bFsj9NNwriJv6X63RvPfCSrToogNFkycIuk9r1xkCZgZTyJgxm4zGqqzPFYprJiJks3YSRxVu9QD0gUDHMjoil3XTEOpR7xQ-wSZ7u27A5H3w178vN2F_UwH8yIuyOo8igQNIs1",
//   expirationTime: null,
//   keys: {
//     p256dh:
//       "BOeZPXXropUz0ZAxqCsRFWpDp4VeV4tZiwBiCUOflabc7ggKVrlNcJ7awKHtU8o8WsTodc9afmLDhLQS-yAQHFI",
//     auth: "bi4XGrVWr0sTM1m_2FGJsA",
//   },
// };

// webpush.sendNotification(pushSubscription, "hey!");
