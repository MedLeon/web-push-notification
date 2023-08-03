const webpush = require("web-push");

// webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  "BC5koZoTOHO9_M818EO3AgJDSMM16GoecgTAKeBk4dAH0q8X2Kao8hh5o0ycK2_t3vu3cBWm-p2f6fUX_BIhb-E",
  "s3R9JPNveMo6SMY5BQn23jJNlUwKeinGYE1EM2Rw2WQ"
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
  endpoint:
    "https://web.push.apple.com/QDhahW0mR3Szyu816jW_JnW20aHB1QSNkkbXH-J8RYClEZzO5f_6pzyn7Opr-e8SX3Vhr1h0b6S4PlqDNQjtMzLoPHkWdk4cm4mJHJ3DbznPzbRxlOVzgPg5N0PY5LLSU5pujOn0r21Ledx-7Lw5bD6Gp3l7i2TSY5ZCO74SvlQ",
  keys: {
    p256dh:
      "BNfO_GIM1z-EzsrAG5nY4HXK01qOibbNjKfur0HPqu-bgLB_iRKV37uNWoh3EnYI67dIEM_UlONTy4j8DXeaDtg",
    auth: "k5MOxUyIgFFoggvYWjNDlA",
  },
};

webpush.sendNotification(pushSubscription, "hey!");
