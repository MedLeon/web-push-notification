import { sendNotification } from "web-push-notification/server";

// get subscription from somewhere. Most likely a DB like Postgres.

// const pushSubscription = {
//   endpoint:
//     "https://fcm.googleapis.com/fcm/send/co5HUsQdtKE:APA91bGA8QUC23y4Prx3nrRsh6KJoKZxz0lHYgiUas3lMX_itbzcY58-NgtiRBCK5IFQ8-Q2OODKgoePc_Wt4vGzSB4tUraM7gCiz_bNrXQbKQkEgxXGOYhLPsZYrk2Tm0lyt-eqPodL",
//   expirationTime: null,
//   keys: {
//     p256dh:
//       "BOTMLSRW_Pd_3KPWzspJeXFq7RichSsk5CHVvN5QAIvr1pd6hnhp2UYfRWo-x59OOprP4wEkyMbJeHpLqwtWmq8",
//     auth: "YxwfH0CqOR1poWVM26McWg",
//   },
// };

const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/chTmn268lEo:APA91bFckxoWemTDaKNF1tsDUqM6MzJGnVrOaZ85N5hpAFSsMtbwK8oX3rn98D3ICdqVKFcPnM_aD7JSQq-j9QiGe2cl36oRjt3sDuq7i8yHwab8CNW79zRz_oWCM0pGxQSA5NCZeBOn",
  expirationTime: null,
  keys: {
    p256dh:
      "BLxBP9wPZyhvPwKr9tQ_2094MRF_CM5T-8r40z-6ZjjyK154zpohkGTxfj3d7omgsVzX8WB11yZrjTtaix3Ogms",
    auth: "P5f0wx4y2NYjGdm4eR51dQ",
  },
};

// create notification information
/** @type {notification} */
const notification = {
  title: "NODE IS WORKING!",
  options: {
    body: "This is a notification from the Node server",
    // actions: [
    //   {
    //     action: "https://www.google.com",
    //     title: "Go to the site",
    //   },
    // ],
    // data: { url: "https://zingy-manatee-afda73.netlify.app/test" },
  },
};

// for chrome testing: {"title":"NODE IS WORKING!","options":{"body":"This is a notification from the Node server","actions":[{"action":"https://www.google.com","title":"Go to the site"}]}}

// your Vapid Details from Step 1
const vapidDetails = {
  subject: "mailto:example@yourdomain.com",
  publicKey:
    "BC5koZoTOHO9_M818EO3AgJDSMM16GoecgTAKeBk4dAH0q8X2Kao8hh5o0ycK2_t3vu3cBWm-p2f6fUX_BIhb-E",
  privateKey: "s3R9JPNveMo6SMY5BQn23jJNlUwKeinGYE1EM2Rw2WQ",
};

sendNotification(notification, pushSubscription, vapidDetails);
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
