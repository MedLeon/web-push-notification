# Web Push notification

# What is it?

Web Push notification only work with two sides: A client (=Web App like React/Svelte/Angular/...) and a server (=node server/cloudflare/deno/...). This library aims to simplify both sides.

The **client library** part...

- is framework agnostic and can be used in Svelte, React, Vue, Qwik, Angular or just with plain JS.

The **server library** part...

- works with Node, Deno and Cloudflare Workers.

# How to use it

## Step 1: Create Vapid Keys

Just go to https://vapid-keys.feron.dev and generate them.

## Step 2: Create subscription on the client side

// npm install

```
import { newSubscription } from "web-push-notification/client"

const mySubscription = await newSubscription({
    applicationServerKey: "you-server-key", //created in step 1
    ...
});

```

... and send this subscription to your node/deno/cloudflare endpoint, that we´ll create in step 3.

```
const stringifiedSubscription = JSON.stringify(mySubscription)
await fetch('https://your-domain.com/subscribe', {body: stringifiedSubscription})
```

## Step 3: Create endpoint for saving on the server/function/edge function

This highly depends on your kind of server/function/edge.

```
// get subscription from the request
const newSubscription = request.body //depends on your server

// save somewhere. Most likely a DB like Postgres.
someImaginativeDB.saveSomewhere(newSubscription)

```

## Step 4: Send Notification

```
import { sendNotification } from "web-push-notification/server";

// get subscription from somewhere. Most likely a DB like Postgres.
const subscription = someImaginativeDB.get(...)

// create notification information
const notification = {
    text: ....
}

// your Vapid Details from Step 1
const vapidDetails = {
    'mailto:example@yourdomain.com', //This must be either a URL or a 'mailto:' address. For example: 'https://your-website.com/contact' or 'mailto: info@your-website.com'
    vapidPublicKey,
    vapidPrivateKey
}

sendNotification(notification, subscription, vapidDetails);

```
